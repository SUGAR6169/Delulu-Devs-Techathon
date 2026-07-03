from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.alert import Alert as AlertModel
from app.schemas.alert import Alert

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=List[Alert])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(AlertModel).order_by(AlertModel.timestamp.desc()).limit(20).all()
