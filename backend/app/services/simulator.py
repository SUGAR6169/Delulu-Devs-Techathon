import asyncio
import random
import uuid
from datetime import datetime, date, timedelta, timezone
import httpx
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.device import Device
from app.models.alert import Alert
from app.models.consumption import DailyConsumption
from app.services.ws_manager import manager

DISCORD_BOT_WEBHOOK_URL = "http://localhost:8001/webhook/alert"

# Initialize global simulated time: July 20, 2026 09:00 AM (Asia/Dhaka timezone offset +06:00)
DHAKA_TZ = timezone(timedelta(hours=6))
SIMULATED_TIME = datetime(2026, 7, 20, 9, 0, 0, tzinfo=DHAKA_TZ)

async def simulate_events():
    """Background task to integrate energy over time and check alerts using 10x simulated time."""
    global SIMULATED_TIME
    
    while True:
        await asyncio.sleep(1) # Run every 1 real-time second
        
        # Advance simulated time by 10 seconds (10x speed)
        SIMULATED_TIME += timedelta(seconds=10)
        
        # Broadcast time tick
        await manager.broadcast({
            "event": "time_tick",
            "data": {
                "simulated_time": SIMULATED_TIME.isoformat()
            }
        })
        
        db: Session = SessionLocal()
        try:
            devices = db.query(Device).all()
            if not devices:
                continue

            # Update Daily Consumption for 10 simulated seconds
            total_watts = sum(d.power_draw_watts for d in devices)
            hours_elapsed = 10.0 / 3600.0
            kwh_added = (total_watts * hours_elapsed) / 1000.0

            # Use simulated date for the consumption record
            simulated_date = SIMULATED_TIME.date()
            consumption = db.query(DailyConsumption).filter(DailyConsumption.date_id == simulated_date).first()
            if not consumption:
                consumption = DailyConsumption(date_id=simulated_date, total_kwh=0.0)
                db.add(consumption)
            
            consumption.total_kwh += kwh_added
            db.commit()

            # Anomaly Detection based on simulated time
            # Group devices by room to check room-level constraints
            rooms = {}
            for d in devices:
                rooms.setdefault(d.room, []).append(d)
                
            for room, room_devices in rooms.items():
                all_devices_on_for_2_hours = True
                has_devices = len(room_devices) > 0
                
                for d in room_devices:
                    if d.status:
                        # Condition 1: After hours (5 PM to 9 AM)
                        if SIMULATED_TIME.hour >= 17 or SIMULATED_TIME.hour < 9:
                            alert_msg = f"{d.room} has devices ON after hours! ({d.name})"
                            await trigger_alert(db, "after_hours", alert_msg)
                            
                        # For Condition 2: check if this device has been on for 2+ hours
                        last_changed = d.last_changed
                        if last_changed.tzinfo is None:
                            last_changed = last_changed.replace(tzinfo=DHAKA_TZ)
                        
                        if (SIMULATED_TIME - last_changed).total_seconds() <= 7200:
                            all_devices_on_for_2_hours = False
                    else:
                        all_devices_on_for_2_hours = False
                
                # Condition 2: ALL devices in the room have been ON for 2+ hours
                if has_devices and all_devices_on_for_2_hours:
                    alert_msg = f"The fans and lights in {room} have been ON for way too long!"
                    await trigger_alert(db, "excessive_usage", alert_msg)

        except Exception as e:
            print(f"Simulator error: {e}")
        finally:
            db.close()


async def apply_scenario(db: Session, scenario_id: str):
    """Applies specific state configurations based on scenario ID and manipulates time."""
    global SIMULATED_TIME
    devices = db.query(Device).all()
    
    updated_devices = []

    if scenario_id == "normal_day":
        SIMULATED_TIME = datetime(2026, 7, 20, 9, 0, 0, tzinfo=DHAKA_TZ)
        # Random daytime setup
        for d in devices:
            d.status = random.choice([True, False])
            d.power_draw_watts = (60.0 if d.type == 'fan' else 15.0) if d.status else 0.0
            d.last_changed = SIMULATED_TIME
            updated_devices.append(d)
            
    elif scenario_id == "late_night_usage":
        SIMULATED_TIME = datetime(2026, 7, 20, 19, 0, 0, tzinfo=DHAKA_TZ)
        # Turn off everything except Work Room 2
        for d in devices:
            if d.room == "Work Room 2":
                d.status = True
                d.power_draw_watts = 60.0 if d.type == 'fan' else 15.0
            else:
                d.status = False
                d.power_draw_watts = 0.0
            d.last_changed = SIMULATED_TIME
            updated_devices.append(d)
            
    elif scenario_id == "prolonged_operation":
        SIMULATED_TIME += timedelta(hours=2)
        # Turn on Work Room 1 devices 
        for d in devices:
            if d.room == "Work Room 1":
                d.status = True
                d.power_draw_watts = 60.0 if d.type == 'fan' else 15.0
                # Set last changed to 2 hours ago to trigger alert
                d.last_changed = SIMULATED_TIME - timedelta(hours=2)
            else:
                d.status = False
                d.power_draw_watts = 0.0
                d.last_changed = SIMULATED_TIME
            updated_devices.append(d)
            
    elif scenario_id == "shutdown":
        # Turn off everything and resolve alerts
        for d in devices:
            d.status = False
            d.power_draw_watts = 0.0
            d.last_changed = SIMULATED_TIME
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
        # Avoid spamming if updated recently (e.g. last 5 simulated seconds? Let's use real time for spam prevention or simulated)
        # Let's use SIMULATED_TIME for timestamps
        last_ts = existing_alert.timestamp
        if last_ts.tzinfo is None:
            last_ts = last_ts.replace(tzinfo=DHAKA_TZ)
            
        time_since_last = (SIMULATED_TIME - last_ts).total_seconds()
        existing_alert.timestamp = SIMULATED_TIME
        existing_alert.count += 1
        db.commit()
        
        alert_data = {
            "id": existing_alert.id,
            "type": existing_alert.type,
            "message": existing_alert.message,
            "timestamp": existing_alert.timestamp.isoformat(),
            "count": existing_alert.count
        }
        
        if time_since_last > 60: # 1 simulated minute
            await manager.broadcast({
                "event": "alert_updated",
                "data": alert_data
            })
        return

    new_alert = Alert(
        id=str(uuid.uuid4()),
        type=alert_type,
        message=message,
        timestamp=SIMULATED_TIME,
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
            headers = {"Authorization": "Bearer secret_webhook_token_123"}
            await client.post(DISCORD_BOT_WEBHOOK_URL, json=alert_data, headers=headers, timeout=2.0)
        except Exception:
            pass
