@echo off
echo Starting frontend application...

REM Install dependencies if not already installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Run the application
npm start