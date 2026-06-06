@echo off
title MintyMarks

echo Stopping anything on ports 8000 and 5173...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 "') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 "') do (
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 1 /nobreak >nul

echo Starting backend...
start "MintyMarks Backend" cmd /k "cd /d "%~dp0backend" && uvicorn main:app --reload"

timeout /t 2 /nobreak >nul

echo Starting frontend...
start "MintyMarks Frontend" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo Both servers are starting.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo.
pause
