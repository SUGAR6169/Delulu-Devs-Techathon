from sqlalchemy import Column, Date, Float
from app.core.database import Base
from datetime import date

class DailyConsumption(Base):
    __tablename__ = "daily_consumption"

    date_id = Column(Date, primary_key=True, default=date.today)
    total_kwh = Column(Float, default=0.0)
