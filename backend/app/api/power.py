from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.device import Device as DeviceModel
from app.models.consumption import DailyConsumption
from app.services import simulator

router = APIRouter(prefix="/power", tags=["power"])

@router.get("/summary")
def get_power_summary(db: Session = Depends(get_db)):
    devices = db.query(DeviceModel).all()
    total_watts = sum(d.power_draw_watts for d in devices)
    rooms = {}
    for d in devices:
        rooms[d.room] = rooms.get(d.room, 0) + d.power_draw_watts
    
    today_consumption = db.query(DailyConsumption).filter(DailyConsumption.date_id == simulator.SIMULATED_TIME.date()).first()
    estimated_kwh = today_consumption.total_kwh if today_consumption else 0.0

    return {
        "total_watts": total_watts,
        "rooms_watts": rooms,
        "estimated_kwh": estimated_kwh
    }
