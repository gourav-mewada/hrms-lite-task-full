from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date
from enum import Enum

class AttendanceStatus(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"

class EmployeeBase(BaseModel):
    employee_id: str = Field(..., description="Unique Employee ID")
    full_name: str = Field(..., min_length=2, description="Full Name")
    email: EmailStr = Field(..., description="Email Address")
    department: str = Field(..., min_length=2, description="Department")

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    pass

class AttendanceBase(BaseModel):
    employee_id: str
    date: date
    status: AttendanceStatus

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceResponse(AttendanceBase):
    pass

class DashboardSummary(BaseModel):
    total_employees: int
    present_today: int
