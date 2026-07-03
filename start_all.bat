@echo off
echo Starting Delulu-Devs-Techathon Project...

REM Start the backend API in a new window (installs requirements first)
start "Backend API" cmd /k "cd backend && pip install -r requirements.txt && py -m uvicorn app.main:app --reload"

REM Start the Discord bot in a new window
start "Discord Bot" cmd /k "cd backend\bot && py main.py"

REM Start the frontend dashboard in a new window
start "Frontend Dashboard" cmd /k "cd frontend && npm run dev"

echo All services started successfully.
