@echo off
setlocal

set "ROOT=%~dp0"

if not exist "%ROOT%package.json" (
  echo package.json was not found in %ROOT%
  pause
  exit /b 1
)

if not exist "%ROOT%node_modules" (
  echo node_modules was not found.
  echo.
  echo Run this first:
  echo cmd /c npm install
  echo.
  pause
  exit /b 1
)

echo Starting React + Vite Webapp Control Center...
echo.
start "" cmd /k "cd /d %ROOT% && cmd /c npm run dev -- --host 127.0.0.1 --port 5173"
echo Dev server starting in a new window.
echo Open http://127.0.0.1:5173 once Vite is ready.
echo.
echo If you also want the backend services, use start-services.bat separately.
exit /b 0
