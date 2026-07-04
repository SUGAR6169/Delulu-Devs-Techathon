from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
import asyncio

from app.core.database import engine, Base, get_db
from app.core.seed import seed_db
from app.api import devices, alerts, power, websockets, simulation
from app.services.simulator import simulate_events

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    
    # Clear alerts on fresh startup so the dashboard begins empty
    from app.models.alert import Alert
    db.query(Alert).delete()
    db.commit()
    
    seed_db(db)
    
    # Start the simulator background task
    task = asyncio.create_task(simulate_events())
    
    yield
    
    # Shutdown
    task.cancel()

app = FastAPI(title="Office Electrical Monitoring System", lifespan=lifespan)

# Allow CORS for dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

app.include_router(devices.router, prefix="/api")
app.include_router(power.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(simulation.router, prefix="/api")
app.include_router(websockets.router)

@app.get("/")
def read_root():
    return {"message": "Office Electrical Monitoring System API"}
