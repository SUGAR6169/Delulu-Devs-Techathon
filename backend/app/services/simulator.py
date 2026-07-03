import asyncio
import random
import uuid
from datetime import datetime, date
import httpx
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.device import Device
from app.models.alert import Alert
from app.models.consumption import DailyConsumption
from app.services.ws_manager import manager

DISCORD_BOT_WEBHOOK_URL = "http://localhost:8001/webhook/alert"

async def simulate_events():
    while True:
        await asyncio.sleep(5)  # Run every 5 seconds for the hackathon demo
        
        db: Session = SessionLocal()
        try:
            # 1. Randomly toggle 1-2 devices
            devices = db.query(Device).all()
            if not devices:
                continue

            num_to_toggle = random.randint(1, 2)
            to_toggle = random.sample(devices, num_to_toggle)

            for d in to_toggle:
                d.status = not d.status
                d.last_changed = datetime.utcnow()
                if d.status:
                    d.power_draw_watts = 60.0 if d.type == 'fan' else 15.0
                else:
                    d.power_draw_watts = 0.0

            # 2. Update Daily Consumption
            # For 5 seconds at current total watts
            total_watts = sum(d.power_draw_watts for d in db.query(Device).all())
            hours_elapsed = 5.0 / 3600.0
            kwh_added = (total_watts * hours_elapsed) / 1000.0

            today = date.today()
            consumption = db.query(DailyConsumption).filter(DailyConsumption.date_id == today).first()
            if not consumption:
                consumption = DailyConsumption(date_id=today, total_kwh=0.0)
                db.add(consumption)
            
            consumption.total_kwh += kwh_added
            db.commit()

            # 3. Broadcast to WebSocket
            for d in to_toggle:
                await manager.broadcast({
                    "event": "state_update",
                    "data": {
                        "id": d.id,
                        "status": d.status,
                        "power_draw_watts": d.power_draw_watts,
                        "last_changed": d.last_changed.isoformat()
                    }
                })

            # 4. Anomaly Detection
            now = datetime.utcnow()
            for d in devices:
                if d.status:
                    # Condition 1: After hours (5 PM to 9 AM)
                    if now.hour >= 17 or now.hour < 9:
                        alert_msg = f"{d.room} has devices ON after hours! ({d.name})"
                        await trigger_alert(db, "after_hours", alert_msg)
                        
                    # Condition 2: Left on for too long (> 2 hours) -> Demo: > 30 seconds
                    elif (now - d.last_changed).total_seconds() > 30: # 30s for demo purposes
                        alert_msg = f"{d.room} - {d.name} has been ON for too long!"
                        await trigger_alert(db, "excessive_usage", alert_msg)

        except Exception as e:
            print(f"Simulator error: {e}")
        finally:
            db.close()

async def trigger_alert(db: Session, alert_type: str, message: str):
    # Check if a recent alert with same message exists to avoid spamming
    recent = db.query(Alert).filter(Alert.message == message).order_by(Alert.timestamp.desc()).first()
    if recent and (datetime.utcnow() - recent.timestamp).total_seconds() < 60:
        return # Skip if we already alerted in the last minute

    new_alert = Alert(
        id=str(uuid.uuid4()),
        type=alert_type,
        message=message,
        timestamp=datetime.utcnow()
    )
    db.add(new_alert)
    db.commit()

    alert_data = {
        "id": new_alert.id,
        "type": new_alert.type,
        "message": new_alert.message,
        "timestamp": new_alert.timestamp.isoformat()
    }

    # Broadcast to WS
    await manager.broadcast({
        "event": "alert_triggered",
        "data": alert_data
    })

    # Proactively POST to Discord Bot Webhook
    async with httpx.AsyncClient() as client:
        try:
            await client.post(DISCORD_BOT_WEBHOOK_URL, json=alert_data, timeout=2.0)
        except Exception as e:
            pass # Suppress logging if bot is not running yet
