from fastapi import APIRouter, HTTPException, status
from app.database import db
from app.schemas import EmployeeCreate, EmployeeResponse
from typing import List

router = APIRouter()

@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    existing_employee = await db.employees.find_one({"employee_id": employee.employee_id})
    if existing_employee:
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    
    employee_dict = employee.dict()
    await db.employees.insert_one(employee_dict)
    return employee

@router.get("", response_model=List[EmployeeResponse])
async def list_employees():
    employees = await db.employees.find().to_list(1000)
    return employees

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(employee_id: str):
    result = await db.employees.delete_one({"employee_id": employee_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    await db.attendance.delete_many({"employee_id": employee_id})
