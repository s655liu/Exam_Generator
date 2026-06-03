@echo off
echo ====================================================
echo  Waterloo Exam Generator Launcher
echo ====================================================
echo.
echo [1/2] Installing/updating Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies. Please ensure Python and pip are installed.
    pause
    exit /b %errorlevel%
)
echo.
echo [2/2] Starting local development server...
python api/index.py
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server exited with error code %errorlevel%.
    pause
)
