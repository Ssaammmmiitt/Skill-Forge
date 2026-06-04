@echo off
cd /d "%~dp0"
if exist "Scripts\python.exe" (
  Scripts\python.exe scripts\run_all.py %*
) else if exist ".venv\Scripts\python.exe" (
  .venv\Scripts\python.exe scripts\run_all.py %*
) else (
  python scripts\run_all.py %*
)
exit /b %ERRORLEVEL%
