@echo off
cd /d "%~dp0"
set "SERVE_DIR=%~dp0"
where node >nul 2>&1
if %errorlevel%==0 if exist package.json (
  echo Menyiapkan build FFU v12...
  call npm run build >nul 2>&1
  if exist dist\index.html set "SERVE_DIR=%~dp0dist"
)
where py >nul 2>&1
if %errorlevel%==0 (
  start "" http://localhost:8080
  py -m http.server 8080 -d "%SERVE_DIR%"
  exit /b
)
where python >nul 2>&1
if %errorlevel%==0 (
  start "" http://localhost:8080
  python -m http.server 8080 -d "%SERVE_DIR%"
  exit /b
)
echo Python tidak ditemukan. Membuka versi standalone...
start "" "%~dp0FFU-Standalone.html"
pause
