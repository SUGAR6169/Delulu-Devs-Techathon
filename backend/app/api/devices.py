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

from app.core.security import verify_api_key

@router.post("/{device_id}/toggle", response_model=Device)
async def toggle_device(device_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    from fastapi import HTTPException
    
    device = db.query(DeviceModel).filter(DeviceModel.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    device.status = not device.status
    if device.status:
        device.power_draw_watts = 60.0 if device.type == 'fan' else 15.0
    else:
        device.power_draw_watts = 0.0
        
    from app.services.simulator import SIMULATED_TIME
    device.last_changed = SIMULATED_TIME
    db.commit()
    
    from app.services.ws_manager import manager
    await manager.broadcast({
        "event": "state_update",
        "data": {
            "id": device.id,
            "status": device.status,
            "power_draw_watts": device.power_draw_watts,
            "last_changed": device.last_changed.isoformat()
        }
    })
    
    return device
