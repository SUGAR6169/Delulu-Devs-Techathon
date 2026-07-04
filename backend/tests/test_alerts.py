import pytest
from app.models.alert import Alert
from app.services.simulator import apply_scenario

@pytest.mark.asyncio
async def test_shutdown_clears_alerts(db_session):
    # Setup: add a fake alert
    db_session.add(Alert(id="test", type="test", message="test alert", count=1))
    db_session.commit()
    
    assert db_session.query(Alert).count() == 1
    
    # Run shutdown
    await apply_scenario(db_session, "shutdown")
    
    # Alerts should be gone
    assert db_session.query(Alert).count() == 0
