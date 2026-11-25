@echo off
cd /d "%~dp0..\.."
echo Starting Pixode at http://127.0.0.1:3000
echo Keep this window open while using the website.
call npm start
pause
