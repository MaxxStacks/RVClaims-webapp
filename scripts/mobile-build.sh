#!/bin/bash
# scripts/mobile-build.sh — Build and sync mobile apps
# Usage:
#   ./scripts/mobile-build.sh setup    — First-time setup
#   ./scripts/mobile-build.sh dev      — Dev build + sync + open
#   ./scripts/mobile-build.sh ios      — Build for iOS
#   ./scripts/mobile-build.sh android  — Build for Android
#   ./scripts/mobile-build.sh both     — Build for both platforms

set -e

COMMAND=${1:-help}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[RVClaims]${NC} $1"; }
warn() { echo -e "${YELLOW}[Warning]${NC} $1"; }
error() { echo -e "${RED}[Error]${NC} $1"; exit 1; }

case $COMMAND in
  setup)
    log "Installing Capacitor dependencies..."
    npm install @capacitor/core @capacitor/cli
    npm install @capacitor/camera @capacitor/filesystem @capacitor/push-notifications
    npm install @capacitor/haptics @capacitor/status-bar @capacitor/keyboard
    npm install @capacitor/splash-screen @capacitor/app @capacitor/browser
    npm install @capacitor/network @capacitor/share @capacitor/local-notifications

    log "Initializing Capacitor..."
    npx cap init "RV Claims" "ca.rvclaims.app" --web-dir dist/public

    log "Adding platforms..."
    npx cap add ios
    npx cap add android

    log "Building web app..."
    npm run build

    log "Syncing to native projects..."
    npx cap sync

    log ""
    log "Setup complete! Next steps:"
    log "  iOS:     npx cap open ios     (opens Xcode)"
    log "  Android: npx cap open android (opens Android Studio)"
    log ""
    log "Before first run, update these in Xcode/Android Studio:"
    log "  - iOS: Add camera/photo permissions to Info.plist"
    log "  - Android: Check AndroidManifest.xml permissions"
    log "  - Both: Set app icons and splash screen assets"
    ;;

  dev)
    log "Building web app..."
    npm run build
    log "Syncing to native..."
    npx cap sync
    log "Opening platforms..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
      npx cap open ios
    fi
    npx cap open android 2>/dev/null || warn "Android Studio not found"
    ;;

  ios)
    log "Building web app for production..."
    NODE_ENV=production npm run build
    log "Syncing to iOS..."
    npx cap sync ios
    log "Opening Xcode..."
    npx cap open ios
    log ""
    log "In Xcode:"
    log "  1. Select your Team in Signing & Capabilities"
    log "  2. Set Bundle Identifier: ca.rvclaims.app"
    log "  3. Product → Archive → Distribute to App Store"
    ;;

  android)
    log "Building web app for production..."
    NODE_ENV=production npm run build
    log "Syncing to Android..."
    npx cap sync android
    log "Opening Android Studio..."
    npx cap open android
    log ""
    log "In Android Studio:"
    log "  1. Build → Generate Signed Bundle/APK"
    log "  2. Choose Android App Bundle (.aab)"
    log "  3. Upload to Google Play Console"
    ;;

  both)
    log "Building web app for production..."
    NODE_ENV=production npm run build
    log "Syncing to both platforms..."
    npx cap sync
    log "Opening platforms..."
    npx cap open ios 2>/dev/null || warn "Xcode not available"
    npx cap open android 2>/dev/null || warn "Android Studio not available"
    ;;

  sync)
    log "Quick sync (no rebuild)..."
    npx cap sync
    log "Done!"
    ;;

  *)
    echo "Usage: ./scripts/mobile-build.sh [setup|dev|ios|android|both|sync]"
    echo ""
    echo "  setup    First-time Capacitor setup (install deps, init, add platforms)"
    echo "  dev      Build + sync + open IDEs"
    echo "  ios      Production build for iOS App Store"
    echo "  android  Production build for Google Play"
    echo "  both     Production build for both platforms"
    echo "  sync     Quick sync without rebuild"
    ;;
esac
