from sqlalchemy import Column, String, Boolean, Float, DateTime
from app.core.database import Base
from datetime import datetime

class Device(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String, index=True)  # 'fan' or 'light'
    room = Column(String, index=True)
    status = Column(Boolean, default=False)
    power_draw_watts = Column(Float, default=0.0)
    last_changed = Column(DateTime, default=datetime.utcnow)
