@echo off
echo Building frontend application...

REM Install dependencies
npm install

REM Build the application
npm run build

echo Build complete! The production files are in the 'build' directory.