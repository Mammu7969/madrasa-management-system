@echo off
title Push Madrasa Management System to GitHub
set "PATH=C:\Users\MIA-G Graphics\.gemini\antigravity\tools\mingit\cmd;C:\Users\MIA-G Graphics\.gemini\antigravity\tools\gh;%PATH%"
cd /d "C:\Users\MIA-G Graphics\.gemini\antigravity\scratch\madrasa-management-system"
cls
echo ===================================================================
echo     MADRASA MANAGEMENT SYSTEM - GITHUB DEPLOYMENT HELPER
echo ===================================================================
echo.
echo Step 1: Checking GitHub Authentication...
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ACTION REQUIRED] Please authorize GitHub in the browser:
    echo A one-time 8-digit code will appear. Press Enter to open the browser,
    echo paste the code, and click "Authorize".
    echo.
    gh auth login --web -p https
) else (
    echo GitHub is already authenticated!
)

echo.
echo Step 2: Configuring remote repository...
git remote set-url origin https://github.com/Mammu7969/madrasa-management-system.git

echo.
echo Step 3: Pushing latest code to GitHub (branch: main)...
git push -u origin main --force

echo.
if %errorlevel% equ 0 (
    echo ===================================================================
    echo  SUCCESS! All code has been pushed to GitHub!
    echo  Vercel is now automatically rebuilding and deploying your site.
    echo ===================================================================
) else (
    echo ===================================================================
    echo  An error occurred while pushing. Please check your internet or retry.
    echo ===================================================================
)
echo.
pause
