from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.simulator import apply_scenario

router = APIRouter()

from app.core.security import verify_api_key

@router.post("/simulation/scenarios/{scenario_id}")
async def activate_scenario(scenario_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    valid_scenarios = ["normal_day", "late_night_usage", "prolonged_operation", "shutdown"]
    if scenario_id not in valid_scenarios:
        raise HTTPException(status_code=404, detail="Scenario not found")
        
    await apply_scenario(db, scenario_id)
    return {"message": f"Scenario {scenario_id} applied successfully"}
