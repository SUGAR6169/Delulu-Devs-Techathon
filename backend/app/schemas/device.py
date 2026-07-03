from pydantic import BaseModel
from datetime import datetime
from typing import Literal

class DeviceBase(BaseModel):
    name: str
    type: Literal['fan', 'light']
    room: Literal['Drawing Room', 'Work Room 1', 'Work Room 2']
    status: bool
    power_draw_watts: float

class DeviceCreate(DeviceBase):
    id: str

class Device(DeviceBase):
    id: str
    last_changed: datetime

    class Config:
        from_attributes = True
