@echo off
setlocal
echo ===================================================
echo   Doha Live IP Hub - GitHub Push Helper
echo ===================================================
echo.
echo Target Remote: https://github.com/malikamaan12/BRANDS.git
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
"%GIT_EXE%" remote add origin https://github.com/malikamaan12/BRANDS.git

echo Preparing branch 'main'...
"%GIT_EXE%" branch -M main

echo.
echo =========================================================================
echo  NOTE ON GITHUB PERMISSIONS:
echo  If your computer currently has 'e3qatech' saved in Windows Credentials,
echo  you can either:
echo    1. Add 'e3qatech' as a Collaborator on https://github.com/malikamaan12/BRANDS/settings/access
echo    OR
echo    2. Enter your GitHub Personal Access Token (classic with repo scope) below.
echo =========================================================================
echo.
set /p TOKEN="Enter GitHub Token for malikamaan12 (or press Enter to try system login): "

if not "%TOKEN%"=="" (
    echo.
    echo Pushing using provided token...
    "%GIT_EXE%" push https://malikamaan12:%TOKEN%@github.com/malikamaan12/BRANDS.git main
) else (
    echo.
    echo Pushing using system credentials...
    "%GIT_EXE%" push -u origin main
)

if %ERRORLEVEL% equ 0 (
    echo.
    echo ===================================================
    echo   SUCCESS! Pushed to GitHub successfully!
    echo ===================================================
) else (
    echo.
    echo [ERROR] Push failed. If it said 'Permission denied to e3qatech',
    echo add 'e3qatech' as collaborator to the repo or provide a token.
)

pause
