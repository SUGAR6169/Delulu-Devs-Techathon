from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
import asyncio

from app.core.database import engine, Base, get_db
from app.core.seed import seed_db
from app.api import devices, alerts, power, websockets
from app.services.simulator import simulate_events

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(devices.router, prefix="/api")
app.include_router(power.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(websockets.router)

@app.get("/")
def read_root():
    return {"message": "Office Electrical Monitoring System API"}
