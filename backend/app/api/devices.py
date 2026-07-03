from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.device import Device as DeviceModel
from app.schemas.device import Device

router = APIRouter(prefix="/devices", tags=["devices"])

@router.get("/", response_model=List[Device])
def get_devices(db: Session = Depends(get_db)):
    return db.query(DeviceModel).all()

@router.get("/{room_name}", response_model=List[Device])
def get_devices_by_room(room_name: str, db: Session = Depends(get_db)):
    return db.query(DeviceModel).filter(DeviceModel.room == room_name).all()
