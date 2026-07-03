import asyncio
import random
import uuid
from datetime import datetime, date, timedelta
import httpx
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.device import Device
from app.models.alert import Alert
from app.models.consumption import DailyConsumption
from app.services.ws_manager import manager

DISCORD_BOT_WEBHOOK_URL = "http://localhost:8001/webhook/alert"

async def simulate_events():
    """Background task to integrate energy over time and check alerts."""
    while True:
        await asyncio.sleep(5)
        
        db: Session = SessionLocal()
        try:
            devices = db.query(Device).all()
            if not devices:
                continue

            # Update Daily Consumption for 5 seconds at current total watts
            total_watts = sum(d.power_draw_watts for d in devices)
            hours_elapsed = 5.0 / 3600.0
            kwh_added = (total_watts * hours_elapsed) / 1000.0

            today = date.today()
            consumption = db.query(DailyConsumption).filter(DailyConsumption.date_id == today).first()
            if not consumption:
                consumption = DailyConsumption(date_id=today, total_kwh=0.0)
                db.add(consumption)
            
            consumption.total_kwh += kwh_added
            db.commit()

            # Anomaly Detection
            now = datetime.utcnow()
            for d in devices:
                if d.status:
                    # Condition 1: After hours (5 PM to 9 AM)
                    if now.hour >= 17 or now.hour < 9:
                        alert_msg = f"{d.room} has devices ON after hours! ({d.name})"
                        await trigger_alert(db, "after_hours", alert_msg)
                        
                    # Condition 2: Left on for too long (> 2 hours). For demo: > 30s
                    elif (now - d.last_changed).total_seconds() > 30:
                        alert_msg = f"{d.room} - {d.name} has been ON for too long!"
                        await trigger_alert(db, "excessive_usage", alert_msg)

        except Exception as e:
            print(f"Simulator error: {e}")
        finally:
            db.close()


async def apply_scenario(db: Session, scenario_id: str):
    """Applies specific state configurations based on scenario ID."""
    devices = db.query(Device).all()
    now = datetime.utcnow()
    
    updated_devices = []

    if scenario_id == "normal_day":
        # Random daytime setup
        for d in devices:
            d.status = random.choice([True, False])
            d.power_draw_watts = (60.0 if d.type == 'fan' else 15.0) if d.status else 0.0
            d.last_changed = now
            updated_devices.append(d)
            
    elif scenario_id == "late_night_usage":
        # Turn off everything except Work Room 2
        for d in devices:
            if d.room == "Work Room 2":
                d.status = True
                d.power_draw_watts = 60.0 if d.type == 'fan' else 15.0
            else:
                d.status = False
                d.power_draw_watts = 0.0
            d.last_changed = now
            updated_devices.append(d)
            
    elif scenario_id == "prolonged_operation":
        # Turn on Work Room 1 devices and fast-forward timestamp
        for d in devices:
            if d.room == "Work Room 1":
                d.status = True
                d.power_draw_watts = 60.0 if d.type == 'fan' else 15.0
                # Fast forward to trigger 2-hour anomaly (demo: > 30s)
                d.last_changed = now - timedelta(seconds=45) 
            else:
                d.status = False
                d.power_draw_watts = 0.0
                d.last_changed = now
            updated_devices.append(d)
            
    elif scenario_id == "shutdown":
        # Turn off everything and resolve alerts
        for d in devices:
            d.status = False
            d.power_draw_watts = 0.0
            d.last_changed = now
            updated_devices.append(d)
        
        # Clear alerts
        db.query(Alert).delete()

    db.commit()

    # Broadcast changes to WS
    for d in updated_devices:
        await manager.broadcast({
            "event": "state_update",
            "data": {
                "id": d.id,
                "status": d.status,
                "power_draw_watts": d.power_draw_watts,
                "last_changed": d.last_changed.isoformat()
            }
        })

async def trigger_alert(db: Session, alert_type: str, message: str):
    existing_alert = db.query(Alert).filter(Alert.message == message).first()
    
    if existing_alert:
        time_since_last = (datetime.utcnow() - existing_alert.timestamp).total_seconds()
        existing_alert.timestamp = datetime.utcnow()
        existing_alert.count += 1
        db.commit()
        
        alert_data = {
            "id": existing_alert.id,
            "type": existing_alert.type,
            "message": existing_alert.message,
            "timestamp": existing_alert.timestamp.isoformat(),
            "count": existing_alert.count
        }
        
        if time_since_last > 5:
            await manager.broadcast({
                "event": "alert_updated",
                "data": alert_data
            })
        return

    new_alert = Alert(
        id=str(uuid.uuid4()),
        type=alert_type,
        message=message,
        timestamp=datetime.utcnow(),
        count=1
    )
    db.add(new_alert)
    db.commit()

    alert_data = {
        "id": new_alert.id,
        "type": new_alert.type,
        "message": new_alert.message,
        "timestamp": new_alert.timestamp.isoformat(),
        "count": new_alert.count
    }

    await manager.broadcast({
        "event": "alert_triggered",
        "data": alert_data
    })

    async with httpx.AsyncClient() as client:
        try:
            await client.post(DISCORD_BOT_WEBHOOK_URL, json=alert_data, timeout=2.0)
        except Exception:
            pass
