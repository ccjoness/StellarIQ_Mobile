@echo off
echo ========================================
echo    StellarIQ Android Build Script
echo ========================================
echo.

echo Checking EAS CLI installation...
call eas --version >nul 2>&1
if %errorlevel% neq 0 (
    echo EAS CLI not found. Installing...
    call npm install -g @expo/eas-cli
    if %errorlevel% neq 0 (
        echo Failed to install EAS CLI. Please install manually.
        pause
        exit /b 1
    )
)

echo EAS CLI is ready!
echo.

echo Please choose build type:
echo 1. Preview (APK for testing)
echo 2. Production (AAB for Play Store)
echo 3. Development (Debug APK)
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo Building Preview APK...
    call eas build --platform android --profile preview
) else if "%choice%"=="2" (
    echo Building Production AAB...
    call eas build --platform android --profile production
) else if "%choice%"=="3" (
    echo Building Development APK...
    call eas build --platform android --profile development
) else (
    echo Invalid choice. Please run the script again.
    pause
    exit /b 1
)

echo.
echo Build started! Check your email for completion notification.
echo You can also monitor progress at: https://expo.dev/accounts/[your-account]/projects/stellariq/builds
echo.
pause
