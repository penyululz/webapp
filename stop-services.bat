@echo off
setlocal

set "ROOT=%~dp0"

where docker >nul 2>nul
if errorlevel 1 (
  echo Docker is not installed or not available in PATH.
  echo Nothing to stop.
  pause
  exit /b 1
)

echo Stopping local service containers...
echo.

call :stop_compose "immich-app(done)" "Immich"
call :stop_compose "seafile(done)" "Seafile"
call :stop_compose "stirling-pdf(done)" "Stirling PDF"
call :stop_compose "wordpress (done)" "WordPress"
call :stop_compose "standardnotes(done)" "Standard Notes"
call :stop_compose "whisperX (transcription ready linux)\whisperX" "WhisperX"

echo.
echo Done.
exit /b 0

:stop_compose
set "APP_DIR=%~1"
set "APP_NAME=%~2"

if not exist "%ROOT%%APP_DIR%\docker-compose.yml" (
  echo [SKIP] %APP_NAME% - docker-compose.yml not found
  exit /b 0
)

echo [STOP] %APP_NAME%
pushd "%ROOT%%APP_DIR%" >nul
docker compose down
if errorlevel 1 (
  echo [WARN] %APP_NAME% failed to stop cleanly
) else (
  echo [OK] %APP_NAME% stopped
)
popd >nul
echo.
exit /b 0
