@echo off
setlocal
echo ===================================================
echo   Doha Live IP Hub - GitHub Push Helper
echo ===================================================
echo.

set GIT_EXE=C:\Users\pceve\.gemini\antigravity-ide\scratch\mingit\cmd\git.exe

if not exist "%GIT_EXE%" (
    where git >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        set GIT_EXE=git
    ) else (
        echo [ERROR] Git executable not found.
        pause
        exit /b 1
    )
)

echo Checking Git status...
"%GIT_EXE%" status

echo.
set /p REPO_URL="Enter your GitHub repository URL (e.g. https://github.com/username/doha-entertainment-ip-hub.git): "

if "%REPO_URL%"=="" (
    echo [ERROR] No repository URL provided. Aborting.
    pause
    exit /b 1
)

echo.
echo Adding remote origin...
"%GIT_EXE%" remote remove origin 2>nul
"%GIT_EXE%" remote add origin %REPO_URL%

echo.
echo Pushing branch 'main' to GitHub...
"%GIT_EXE%" branch -M main
"%GIT_EXE%" push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ===================================================
    echo   SUCCESS! Pushed to GitHub successfully!
    echo ===================================================
) else (
    echo.
    echo [ERROR] Push failed. Please verify your GitHub credentials or repository permissions.
)

pause
