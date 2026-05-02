@echo off
cd /d "%~dp0"

echo Killing old backend on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /PID %%a /F >nul 2>&1

echo Starting Knowledge Base...
start "KB" cmd /k "cd /d "%~dp0Knowledge Base" && uvicorn api:app --reload"

timeout /t 3 >nul

echo Starting Backend...
start "Backend" cmd /k "cd /d "%~dp0tareo-backend" && npm run dev"

timeout /t 5 >nul

echo Starting Frontend...
start "Frontend" cmd /k "cd /d "%~dp0tareo-frontend" && npx expo start --web"

echo ALL SERVICES STARTED 🚀
pause