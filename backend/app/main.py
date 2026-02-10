from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import employees, attendance
from app.database import db, client
from app.schemas import DashboardSummary
from datetime import date
import asyncio

app = FastAPI(title="HRMS Lite API")

@app.on_event("startup")
async def startup_db_client():
    try:
        await client.admin.command('ping')
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router, prefix="/employees", tags=["Employees"])
app.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])

@app.get("/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary():
    total_employees = await db.employees.count_documents({})
    today_str = date.today().isoformat()
    present_today = await db.attendance.count_documents({
        "date": today_str,
        "status": "Present"
    })
    return {
        "total_employees": total_employees,
        "present_today": present_today
    }
