@echo off
title Dashboard Alarm BD - Launch All Services
echo ========================================================
echo  Dashboard Alarm BD – Phase 1 (Demo Version)
echo  PM Shop Machine Breakdown Monitoring System
echo ========================================================
echo Starting Backend (FastAPI on http://localhost:8000)...
start "Dashboard Alarm BD - Backend" cmd /k "python run_backend.py"

echo Waiting 2 seconds for backend initialization...
timeout /t 2 /nobreak >nul

echo Starting Frontend (Vite on http://localhost:5173)...
start "Dashboard Alarm BD - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo  Both services launched!
echo  Backend:  http://localhost:8000 (API & Docs at /docs)
echo  Frontend: http://localhost:5173
echo ========================================================
echo.

