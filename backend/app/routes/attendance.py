from fastapi import APIRouter, HTTPException, status
from app.database import db
from app.schemas import AttendanceCreate, AttendanceResponse, AttendanceStatus
from typing import List
from datetime import date

router = APIRouter()

@router.post("", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(attendance: AttendanceCreate):
    employee = await db.employees.find_one({"employee_id": attendance.employee_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    attendance_dict = attendance.dict()
    
    attendance_dict['date'] = attendance.date.isoformat()
    
    existing = await db.attendance.find_one({
        "employee_id": attendance.employee_id,
        "date": attendance_dict['date']
    })

    if existing:
        await db.attendance.update_one(
            {"_id": existing["_id"]},
            {"$set": {"status": attendance.status}}
        )
    else:
        await db.attendance.insert_one(attendance_dict)
    
    return attendance

@router.get("", response_model=List[AttendanceResponse])
async def get_all_attendance():
    cursor = db.attendance.find().sort("date", -1)
    attendance_records = await cursor.to_list(1000)
    return attendance_records

@router.get("/{employee_id}", response_model=List[AttendanceResponse])
async def get_attendance(employee_id: str):
    # Sort by date descending
    cursor = db.attendance.find({"employee_id": employee_id}).sort("date", -1)
    attendance_records = await cursor.to_list(1000)
    return attendance_records
