from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import pymysql
from datetime import datetime, timedelta, timedelta
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Curing database connection configuration
CURING_MYSQL_CONFIG = {
    'host': '35.208.174.2',
    'user': 'root',
    'password': 'Dev112233',
    'database': 'kpi_table',
    'cursorclass': pymysql.cursors.DictCursor,
    'charset': 'utf8mb4'
}

def get_curing_mysql_connection():
    """Create and return Curing MySQL connection"""
    return pymysql.connect(**CURING_MYSQL_CONFIG)


# MySQL connection configuration
MYSQL_CONFIG = {
    'host': '35.208.174.2',
    'user': 'root',
    'password': 'Dev112233',
    'database': 'jkplanningV1',
    'cursorclass': pymysql.cursors.DictCursor,
    'charset': 'utf8mb4'
}

def get_mysql_connection():
    """Create and return MySQL connection"""
    return pymysql.connect(**MYSQL_CONFIG)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class InventoryItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: Optional[str] = None
    section: Optional[str] = None
    machine_id: Optional[str] = None
    machine_name: Optional[str] = None
    machine_display_name: Optional[str] = None
    machine_display_id: Optional[str] = None
    shift: Optional[str] = None
    item_code: Optional[str] = None
    lot_no: Optional[str] = None
    item_type: Optional[str] = None
    mhe_no: Optional[str] = None
    booked_quantity: Optional[float] = None
    current_quantity: Optional[float] = None
    uom: Optional[str] = None
    quality_status: Optional[str] = None
    captured_date: Optional[str] = None
    captured_date_ist: Optional[str] = None
    date_of_production: Optional[str] = None
    time_of_production: Optional[str] = None
    use_after: Optional[str] = None
    use_before: Optional[str] = None

class FilterOptions(BaseModel):
    captured_dates: List[str] = []
    item_types: List[str] = []
    item_codes: List[str] = []
    machine_names: List[str] = []
    machine_ids: List[str] = []
    uoms: List[str] = []
    quality_statuses: List[str] = []
    mhe_nos: List[str] = []

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "JK Tyre BTP Inventory Dashboard API"}

@api_router.get("/inventory", response_model=List[InventoryItem])
async def get_inventory(
    captured_date: Optional[str] = Query(None),
    item_type: Optional[str] = Query(None),
    item_code: Optional[str] = Query(None),
    machine_name: Optional[str] = Query(None),
    machine_id: Optional[str] = Query(None),
    uom: Optional[str] = Query(None),
    quality_status: Optional[str] = Query(None),
    mhe_no: Optional[str] = Query(None)
):
    """
    Fetch inventory data from MySQL with optional filters
    Only returns data from 2026 (using createdAt column)
    """
    try:
        connection = get_mysql_connection()
        with connection.cursor() as cursor:
            # Base query with JOIN to MasterMachines - Using createdAt as main date column
            query = """
                SELECT 
                    i.id,
                    i.section,
                    i.machineId as machine_id,
                    m.machineDisplayName as machine_name,
                    m.machineDisplayName as machine_display_name,
                    m.machineDisplayId as machine_display_id,
                    i.shift,
                    i.itemCode as item_code,
                    i.lotNo as lot_no,
                    i.itemType as item_type,
                    i.mheNo as mhe_no,
                    i.bookedQuantity as booked_quantity,
                    i.currentQuantity as current_quantity,
                    i.uom,
                    i.qualityStatus as quality_status,
                    i.createdAt as captured_date,
                    DATE_ADD(i.createdAt, INTERVAL 330 MINUTE) as captured_date_ist,
                    DATE(i.productionTime) as date_of_production,
                    TIME(i.productionTime) as time_of_production,
                    i.useAfter as use_after,
                    i.useBefore as use_before
                FROM Inventory i
                LEFT JOIN MasterMachines m ON i.machineId = m.id
                WHERE YEAR(i.createdAt) = 2026
            """
            
            # Add filters dynamically
            conditions = []
            params = []
            
            if captured_date:
                conditions.append("DATE(DATE_ADD(i.date, INTERVAL 330 MINUTE)) = %s")
                params.append(captured_date)
            
            if item_type:
                conditions.append("i.itemType = %s")
                params.append(item_type)
            
            if item_code:
                conditions.append("i.itemCode = %s")
                params.append(item_code)
            
            if machine_name:
                conditions.append("m.machineDisplayName = %s")
                params.append(machine_name)
            
            if machine_id:
                conditions.append("m.machineDisplayId = %s")
                params.append(machine_id)
            
            if uom:
                conditions.append("i.uom = %s")
                params.append(uom)
            
            if quality_status:
                conditions.append("i.qualityStatus = %s")
                params.append(quality_status)
            
            if mhe_no:
                conditions.append("i.mheNo = %s")
                params.append(mhe_no)
            
            if conditions:
                query += " AND " + " AND ".join(conditions)
            
            query += " ORDER BY i.createdAt DESC LIMIT 10000"
            
            cursor.execute(query, params)
            result = cursor.fetchall()
            
            # Normalize quality status to proper case
            quality_status_mapping = {
                'ready to use': 'Ready To Use',
                'consumed': 'Consumed',
                'consumed1': 'Consumed1',
                'decision pending': 'Decision Pending',
                'ncmhold': 'NCMHold',
                'hold': 'Hold'
            }
            
            # Convert datetime objects to strings and normalize quality status
            for row in result:
                # Normalize quality status
                if row.get('quality_status'):
                    normalized = quality_status_mapping.get(
                        row['quality_status'].lower(), 
                        row['quality_status']
                    )
                    row['quality_status'] = normalized
                
                # Convert date/time objects to strings
                for key, value in row.items():
                    if isinstance(value, (datetime, timedelta)):
                        row[key] = value.isoformat() if isinstance(value, datetime) else str(value)
                    elif hasattr(value, 'isoformat'):  # This will catch date objects
                        row[key] = value.isoformat()
            
            return result
    
    except Exception as e:
        logger.error(f"Error fetching inventory: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'connection' in locals():
            connection.close()

@api_router.get("/filter-options", response_model=FilterOptions)
async def get_filter_options():
    """
    Get all unique filter options from the database for 2026 data (using createdAt)
    """
    try:
        connection = get_mysql_connection()
        with connection.cursor() as cursor:
            # Get unique values for each filter
            filter_data = {}
            
            # Captured dates (IST) - using createdAt column
            cursor.execute("""
                SELECT DISTINCT DATE(DATE_ADD(createdAt, INTERVAL 330 MINUTE)) as date_ist
                FROM Inventory
                WHERE YEAR(createdAt) = 2026 AND createdAt IS NOT NULL
                ORDER BY date_ist DESC
                LIMIT 100
            """)
            dates = cursor.fetchall()
            filter_data['captured_dates'] = [str(d['date_ist']) for d in dates if d['date_ist']]
            
            # Item types
            cursor.execute("""
                SELECT DISTINCT itemType
                FROM Inventory
                WHERE YEAR(createdAt) = 2026 AND itemType IS NOT NULL
                ORDER BY itemType
            """)
            filter_data['item_types'] = [row['itemType'] for row in cursor.fetchall() if row['itemType']]
            
            # Item codes
            cursor.execute("""
                SELECT DISTINCT itemCode
                FROM Inventory
                WHERE YEAR(createdAt) = 2026 AND itemCode IS NOT NULL
                ORDER BY itemCode
                LIMIT 200
            """)
            filter_data['item_codes'] = [row['itemCode'] for row in cursor.fetchall() if row['itemCode']]
            
            # Machine names
            cursor.execute("""
                SELECT DISTINCT m.machineDisplayName
                FROM Inventory i
                LEFT JOIN MasterMachines m ON i.machineId = m.id
                WHERE YEAR(i.createdAt) = 2026 AND m.machineDisplayName IS NOT NULL
                ORDER BY m.machineDisplayName
            """)
            filter_data['machine_names'] = [row['machineDisplayName'] for row in cursor.fetchall() if row['machineDisplayName']]
            
            # Machine IDs
            cursor.execute("""
                SELECT DISTINCT m.machineDisplayId
                FROM Inventory i
                LEFT JOIN MasterMachines m ON i.machineId = m.id
                WHERE YEAR(i.createdAt) = 2026 AND m.machineDisplayId IS NOT NULL
                ORDER BY m.machineDisplayId
            """)
            filter_data['machine_ids'] = [row['machineDisplayId'] for row in cursor.fetchall() if row['machineDisplayId']]
            
            # UOMs
            cursor.execute("""
                SELECT DISTINCT uom
                FROM Inventory
                WHERE YEAR(createdAt) = 2026 AND uom IS NOT NULL
                ORDER BY uom
            """)
            filter_data['uoms'] = [row['uom'] for row in cursor.fetchall() if row['uom']]
            
            # Quality statuses
            cursor.execute("""
                SELECT DISTINCT qualityStatus
                FROM Inventory
                WHERE YEAR(createdAt) = 2026 AND qualityStatus IS NOT NULL
                ORDER BY qualityStatus
            """)
            filter_data['quality_statuses'] = [row['qualityStatus'] for row in cursor.fetchall() if row['qualityStatus']]
            
            # MHE Numbers
            cursor.execute("""
                SELECT DISTINCT mheNo
                FROM Inventory
                WHERE YEAR(createdAt) = 2026 AND mheNo IS NOT NULL
                ORDER BY mheNo
                LIMIT 200
            """)
            filter_data['mhe_nos'] = [row['mheNo'] for row in cursor.fetchall() if row['mheNo']]
            
            return filter_data
    
    except Exception as e:
        logger.error(f"Error fetching filter options: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:


# ===== CURING DASHBOARD ENDPOINTS =====

@api_router.get("/curing/summary")
async def get_curing_summary(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    recipe_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    defect_area: Optional[str] = Query(None)
):
    """Get curing dashboard summary KPIs"""
    try:
        connection = get_curing_mysql_connection()
        with connection.cursor() as cursor:
            # Build WHERE clause for filters
            where_conditions = []
            params = []
            
            if start_date and end_date:
                where_conditions.append("DateTime BETWEEN %s AND %s")
                params.extend([start_date, end_date])
            
            where_clause = f" WHERE {' AND '.join(where_conditions)}" if where_conditions else ""
            
            # 1. Total Production
            prod_where = ""
            prod_params = []
            if start_date and end_date:
                prod_where = " WHERE DateTime BETWEEN %s AND %s"
                prod_params = [start_date, end_date]
            if recipe_id:
                prod_where += (" WHERE" if not prod_where else " AND") + " recipeID = %s"
                prod_params.append(recipe_id)
                
            cursor.execute(f"""
                SELECT COALESCE(SUM(Production), 0) as total_production
                FROM curing_prod_agg_year_month_day_hour
                {prod_where}
            """, prod_params)
            total_production = cursor.fetchone()['total_production']
            
            # 2. Scrap Rate
            scrap_where = where_clause
            scrap_params = params.copy()
            if recipe_id:
                scrap_where += (" WHERE" if not scrap_where else " AND") + " tbmrecipeID = %s"
                scrap_params.append(recipe_id)
            if status:
                scrap_where += (" WHERE" if not scrap_where else " AND") + " status_name = %s"
                scrap_params.append(status)
            if defect_area:
                scrap_where += (" WHERE" if not scrap_where else " AND") + " DefectAreaName = %s"
                scrap_params.append(defect_area)
                
            cursor.execute(f"""
                SELECT 
                    COUNT(DISTINCT CASE WHEN LOWER(status_name) = 'scrap' THEN gtbarCode END) as scrap_count,
                    COUNT(DISTINCT gtbarCode) as total_count
                FROM curing_pcr_visual_event_level
                {scrap_where}
            """, scrap_params)
            scrap_data = cursor.fetchone()
            scrap_rate = (scrap_data['scrap_count'] / scrap_data['total_count'] * 100) if scrap_data['total_count'] > 0 else 0
            
            # 3. Rework Rate
            cursor.execute(f"""
                SELECT 
                    COUNT(DISTINCT CASE WHEN LOWER(status_name) = 'rework' THEN gtbarCode END) as rework_count,
                    COUNT(DISTINCT gtbarCode) as total_count
                FROM curing_pcr_visual_event_level
                {scrap_where}
            """, scrap_params)
            rework_data = cursor.fetchone()
            rework_rate = (rework_data['rework_count'] / rework_data['total_count'] * 100) if rework_data['total_count'] > 0 else 0
            
            # 4. NCM Hold
            ncm_where = ""
            ncm_params = []
            if start_date and end_date:
                ncm_where = " WHERE hold_dt BETWEEN %s AND %s"
                ncm_params = [start_date, end_date]
            if recipe_id:
                ncm_where += (" WHERE" if not ncm_where else " AND") + " Recipe = %s"
                ncm_params.append(recipe_id)
                
            cursor.execute(f"""
                SELECT COUNT(DISTINCT Barcode) as ncm_hold_count
                FROM curing_ncm_hold_with_reason
                {ncm_where}
            """, ncm_params)
            ncm_hold = cursor.fetchone()['ncm_hold_count']
            
            # 5. Avg Cycle Time
            cycle_where = ""
            cycle_params = []
            if start_date and end_date:
                cycle_where = " WHERE Previous_Cycle_Time BETWEEN %s AND %s"
                cycle_params = [start_date, end_date]
            if recipe_id:
                cycle_where += (" WHERE" if not cycle_where else " AND") + " Recipe_ID = %s"
                cycle_params.append(recipe_id)
                
            cursor.execute(f"""
                SELECT AVG(Cycle_Time_Minutes) as avg_cycle_time
                FROM curing_cycle_times_all
                {cycle_where} AND Cycle_Time_Minutes <= 40.1
            """, cycle_params)
            result = cursor.fetchone()
            avg_cycle_time = result['avg_cycle_time'] if result['avg_cycle_time'] else 0
            
            # 6. Avg Changeover Time
            changeover_where = ""
            changeover_params = []
            if start_date and end_date:
                changeover_where = " WHERE Previous_Cycle_Time BETWEEN %s AND %s"
                changeover_params = [start_date, end_date]
                
            cursor.execute(f"""
                SELECT AVG(Gap_Minutes) as avg_changeover_time
                FROM curing_changeover_real
                {changeover_where} AND Gap_Minutes <= 60
            """, changeover_params)
            result = cursor.fetchone()
            avg_changeover_time = result['avg_changeover_time'] if result['avg_changeover_time'] else 0
            
            # 7. Total Changeover
            cursor.execute(f"""
                SELECT COUNT(*) as total_changeover
                FROM curing_changeover_real
                {changeover_where} AND Recipe_Changed = 1
            """, changeover_params)
            total_changeover = cursor.fetchone()['total_changeover']
            
            return {
                'total_production': float(total_production) if total_production else 0,
                'scrap_rate': round(float(scrap_rate), 2),
                'rework_rate': round(float(rework_rate), 2),
                'ncm_hold': int(ncm_hold),
                'avg_cycle_time': round(float(avg_cycle_time), 2),
                'avg_changeover_time': round(float(avg_changeover_time), 2),
                'total_changeover': int(total_changeover)
            }
    except Exception as e:
        logger.error(f"Error fetching curing summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'connection' in locals():
            connection.close()

@api_router.get("/curing/production-by-press")
async def get_production_by_press(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    recipe_id: Optional[str] = Query(None)
):
    """Get production grouped by press"""
    try:
        connection = get_curing_mysql_connection()
        with connection.cursor() as cursor:
            where_clause = ""
            params = []
            if start_date and end_date:
                where_clause = " WHERE DateTime BETWEEN %s AND %s"
                params = [start_date, end_date]
            if recipe_id:
                where_clause += (" WHERE" if not where_clause else " AND") + " recipeID = %s"
                params.append(recipe_id)
                
            cursor.execute(f"""
                SELECT wcID, SUM(Production) as total_production
                FROM curing_prod_agg_year_month_day_hour
                {where_clause}
                GROUP BY wcID
                ORDER BY total_production DESC
            """, params)
            
            return cursor.fetchall()
    except Exception as e:
        logger.error(f"Error fetching production by press: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'connection' in locals():
            connection.close()

@api_router.get("/curing/production-by-recipe")
async def get_production_by_recipe(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    recipe_id: Optional[str] = Query(None)
):
    """Get production grouped by recipe"""
    try:
        connection = get_curing_mysql_connection()
        with connection.cursor() as cursor:
            where_clause = ""
            params = []
            if start_date and end_date:
                where_clause = " WHERE DateTime BETWEEN %s AND %s"
                params = [start_date, end_date]
            if recipe_id:
                where_clause += (" WHERE" if not where_clause else " AND") + " recipeID = %s"
                params.append(recipe_id)
                
            cursor.execute(f"""
                SELECT recipeID, SUM(Production) as total_production
                FROM curing_prod_agg_year_month_day_hour
                {where_clause}
                GROUP BY recipeID
                ORDER BY total_production DESC
                LIMIT 15
            """, params)
            
            return cursor.fetchall()
    except Exception as e:
        logger.error(f"Error fetching production by recipe: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'connection' in locals():
            connection.close()

        if 'connection' in locals():
            connection.close()

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)