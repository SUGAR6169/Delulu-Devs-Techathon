from sqlalchemy.orm import Session
from app.models.device import Device
from app.models.alert import Alert
from app.models.consumption import DailyConsumption
from app.core.database import engine, Base

def seed_db(db: Session):
    Base.metadata.create_all(bind=engine)
    
    # Check if we already seeded
    if db.query(Device).first():
        return

    rooms = ['Drawing Room', 'Work Room 1', 'Work Room 2']
    room_prefixes = {'Drawing Room': 'drawing', 'Work Room 1': 'work1', 'Work Room 2': 'work2'}
    
    for room in rooms:
        prefix = room_prefixes[room]
        for i in range(1, 4):
            # 3 fans
            db.add(Device(
                id=f"{prefix}_fan_{i}",
                name=f"Fan {i}",
                type="fan",
                room=room,
                status=False,
                power_draw_watts=0.0,
            ))
            # 3 lights
            db.add(Device(
                id=f"{prefix}_light_{i}",
                name=f"Light {i}",
                type="light",
                room=room,
                status=False,
                power_draw_watts=0.0,
            ))
    db.commit()
