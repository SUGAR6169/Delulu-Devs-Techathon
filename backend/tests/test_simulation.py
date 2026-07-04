import pytest
from app.models.device import Device
from app.services.simulator import apply_scenario

@pytest.mark.asyncio
async def test_normal_day_scenario(db_session, client):
    # Apply normal day
    await apply_scenario(db_session, "normal_day")
    
    devices = db_session.query(Device).all()
    # At least some might be on, some off, but total power should be correct
    for d in devices:
        if d.status:
            expected_power = 60.0 if d.type == 'fan' else 15.0
            assert d.power_draw_watts == expected_power
        else:
            assert d.power_draw_watts == 0.0

@pytest.mark.asyncio
async def test_late_night_usage_scenario(db_session, client):
    await apply_scenario(db_session, "late_night_usage")
    
    devices = db_session.query(Device).all()
    for d in devices:
        if d.room == "Work Room 2":
            assert d.status is True
            assert d.power_draw_watts > 0
        else:
            assert d.status is False
            assert d.power_draw_watts == 0.0

@pytest.mark.asyncio
async def test_shutdown_scenario(db_session, client):
    await apply_scenario(db_session, "shutdown")
    
    devices = db_session.query(Device).all()
    for d in devices:
        assert d.status is False
        assert d.power_draw_watts == 0.0
