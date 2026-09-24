@echo off
setlocal
echo ===================================================
echo   Doha Live IP Hub - GitHub Push Helper
echo ===================================================
echo.
echo Target Remote: https://github.com/malikamaan12/BRANDS-IP.git
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

echo Ensuring remote origin is configured...
"%GIT_EXE%" remote remove origin 2>nul
"%GIT_EXE%" remote add origin https://github.com/malikamaan12/BRANDS-IP.git

echo.
echo Preparing branch 'main'...
"%GIT_EXE%" branch -M main

echo.
echo =========================================================================
echo  NOTE: If https://github.com/malikamaan12/BRANDS-IP does not exist yet:
echo  1. Please visit: https://github.com/new
echo  2. Set Repository name to: BRANDS-IP
echo  3. Choose Public or Private, and click 'Create repository'
echo =========================================================================
echo.
pause

echo.
echo Pushing commits to GitHub...
"%GIT_EXE%" push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ===================================================
    echo   SUCCESS! Pushed to GitHub successfully!
    echo ===================================================
) else (
    echo.
    echo [NOTICE] If GitHub asked for authentication, sign in in the popup window.
    echo If it failed with 404 Not Found, make sure https://github.com/malikamaan12/BRANDS-IP is created on GitHub!
)

pause
