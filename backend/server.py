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
            # Base query with JOIN to MasterMachines - Using createdAt for year filtering
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
                    i.date as captured_date,
                    DATE_ADD(i.date, INTERVAL 330 MINUTE) as captured_date_ist,
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
            
            query += " ORDER BY i.date DESC LIMIT 10000"
            
            cursor.execute(query, params)
            result = cursor.fetchall()
            
            # Convert datetime objects to strings
            for row in result:
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
    Get all unique filter options from the database for 2026 data
    """
    try:
        connection = get_mysql_connection()
        with connection.cursor() as cursor:
            # Get unique values for each filter
            filter_data = {}
            
            # Captured dates (IST)
            cursor.execute("""
                SELECT DISTINCT DATE(DATE_ADD(date, INTERVAL 330 MINUTE)) as date_ist
                FROM Inventory
                WHERE YEAR(date) = 2026 AND date IS NOT NULL
                ORDER BY date_ist DESC
                LIMIT 100
            """)
            dates = cursor.fetchall()
            filter_data['captured_dates'] = [str(d['date_ist']) for d in dates if d['date_ist']]
            
            # Item types
            cursor.execute("""
                SELECT DISTINCT itemType
                FROM Inventory
                WHERE YEAR(date) = 2026 AND itemType IS NOT NULL
                ORDER BY itemType
            """)
            filter_data['item_types'] = [row['itemType'] for row in cursor.fetchall() if row['itemType']]
            
            # Item codes
            cursor.execute("""
                SELECT DISTINCT itemCode
                FROM Inventory
                WHERE YEAR(date) = 2026 AND itemCode IS NOT NULL
                ORDER BY itemCode
                LIMIT 200
            """)
            filter_data['item_codes'] = [row['itemCode'] for row in cursor.fetchall() if row['itemCode']]
            
            # Machine names
            cursor.execute("""
                SELECT DISTINCT m.machineDisplayName
                FROM Inventory i
                LEFT JOIN MasterMachines m ON i.machineId = m.id
                WHERE YEAR(i.date) = 2026 AND m.machineDisplayName IS NOT NULL
                ORDER BY m.machineDisplayName
            """)
            filter_data['machine_names'] = [row['machineDisplayName'] for row in cursor.fetchall() if row['machineDisplayName']]
            
            # Machine IDs
            cursor.execute("""
                SELECT DISTINCT m.machineDisplayId
                FROM Inventory i
                LEFT JOIN MasterMachines m ON i.machineId = m.id
                WHERE YEAR(i.date) = 2026 AND m.machineDisplayId IS NOT NULL
                ORDER BY m.machineDisplayId
            """)
            filter_data['machine_ids'] = [row['machineDisplayId'] for row in cursor.fetchall() if row['machineDisplayId']]
            
            # UOMs
            cursor.execute("""
                SELECT DISTINCT uom
                FROM Inventory
                WHERE YEAR(date) = 2026 AND uom IS NOT NULL
                ORDER BY uom
            """)
            filter_data['uoms'] = [row['uom'] for row in cursor.fetchall() if row['uom']]
            
            # Quality statuses
            cursor.execute("""
                SELECT DISTINCT qualityStatus
                FROM Inventory
                WHERE YEAR(date) = 2026 AND qualityStatus IS NOT NULL
                ORDER BY qualityStatus
            """)
            filter_data['quality_statuses'] = [row['qualityStatus'] for row in cursor.fetchall() if row['qualityStatus']]
            
            # MHE Numbers
            cursor.execute("""
                SELECT DISTINCT mheNo
                FROM Inventory
                WHERE YEAR(date) = 2026 AND mheNo IS NOT NULL
                ORDER BY mheNo
                LIMIT 200
            """)
            filter_data['mhe_nos'] = [row['mheNo'] for row in cursor.fetchall() if row['mheNo']]
            
            return filter_data
    
    except Exception as e:
        logger.error(f"Error fetching filter options: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
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