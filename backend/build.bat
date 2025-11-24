@echo off
echo Building backend application...

REM Create virtual environment
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
pip install -r requirements.txt

echo Build complete! The virtual environment is ready.
echo To run the application, activate the virtual environment and run 'python main.py'