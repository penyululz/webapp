@echo off
setlocal

set "ROOT=%~dp0"

echo Starting centralized personal webapp...
echo.

call "%ROOT%start-services.bat"
echo.
call "%ROOT%start-hub.bat"
