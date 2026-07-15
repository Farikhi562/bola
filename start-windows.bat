@echo off
where py >nul 2>&1
if %errorlevel%==0 (
  start http://localhost:8080
  py -m http.server 8080
) else (
  start http://localhost:8080
  python -m http.server 8080
)
