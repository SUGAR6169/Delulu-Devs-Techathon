from pydantic import BaseModel
from datetime import datetime

class AlertBase(BaseModel):
    type: str
    message: str

class AlertCreate(AlertBase):
    id: str

class Alert(AlertBase):
    id: str
    timestamp: datetime

    class Config:
        from_attributes = True
