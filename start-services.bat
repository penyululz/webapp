@echo off
setlocal

set "ROOT=%~dp0"

where docker >nul 2>nul
if errorlevel 1 (
  echo Docker is not installed or not available in PATH.
  echo.
  echo These services need Docker Desktop:
  echo Immich, Seafile, Stirling PDF, WordPress, Standard Notes, and WhisperX.
  pause
  exit /b 1
)

echo Starting local service containers...
echo.

docker context use desktop-linux >nul
if errorlevel 1 (
  echo Failed to switch Docker to the Linux engine context.
  echo Open Docker Desktop and make sure Linux containers are enabled.
  pause
  exit /b 1
)

call :start_compose "immich-app(done)" "Immich"
call :start_compose "seafile(done)" "Seafile"
call :start_compose "stirling-pdf(done)" "Stirling PDF"
call :start_compose "wordpress (done)" "WordPress"
call :start_compose "standardnotes(done)" "Standard Notes"
call :start_compose "whisperX (transcription ready linux)\whisperX" "WhisperX"

echo.
echo Services start requested.
echo Immich:        http://localhost:2283
echo Seafile:       http://localhost:8082
echo Stirling PDF:  http://localhost:8083
echo WordPress:     http://localhost:8084
echo phpMyAdmin:    http://localhost:8085
echo Std Notes web: http://localhost:3007
echo Std Notes API: http://localhost:3004
echo WhisperX web:  http://localhost:3030
echo WhisperX API:  http://localhost:3020
exit /b 0

:start_compose
set "APP_DIR=%~1"
set "APP_NAME=%~2"

if not exist "%ROOT%%APP_DIR%\docker-compose.yml" (
  echo [SKIP] %APP_NAME% - docker-compose.yml not found
  exit /b 0
)

echo [START] %APP_NAME%
pushd "%ROOT%%APP_DIR%" >nul
docker compose up -d
if errorlevel 1 (
  echo [WARN] %APP_NAME% failed to start
) else (
  echo [OK] %APP_NAME% is starting
)
popd >nul
echo.
exit /b 0
