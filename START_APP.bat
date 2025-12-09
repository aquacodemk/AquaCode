@echo off
cd /d "%~dp0"
echo Се стартува AQUA CODE...
echo Ве молиме почекајте, прелистувачот ќе се отвори наскоро.
start "" "http://localhost:5173/AquaCode/"
npm run dev