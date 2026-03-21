// capacitor.config.ts — Capacitor configuration for Dealer Suite 360 mobile app
// Wraps the existing React web app into native iOS + Android shells
// Run: npx cap init → npx cap add ios → npx cap add android

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dealersuite360.app',
  appName: 'Dealer Suite 360',
  webDir: 'dist/public',

  // Server config — in dev, point to local Vite server
  // In production, this is removed and the built files are used
  server: {
    // Uncomment for dev:
    // url: 'http://192.168.1.X:3001',
    // cleartext: true,
    androidScheme: 'https',
    iosScheme: 'https',
  },

  plugins: {
    // Camera — photo capture for claims, unit tags, profile photos
    Camera: {
      // iOS requires these permission descriptions
    },

    // Push Notifications — claim updates, messages, invoice alerts
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },

    // Status Bar — match app branding
    StatusBar: {
      style: 'DARK',         // Light text for dark brand header
      backgroundColor: '#0747fe',
    },

    // Keyboard — auto-scroll when keyboard opens
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },

    // Splash Screen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0747fe',
      showSpinner: true,
      spinnerColor: '#ffffff',
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
    },

    // Local Notifications (offline alerts)
    LocalNotifications: {
      smallIcon: 'ic_notification',
      iconColor: '#0747fe',
    },

    // Haptics — tactile feedback on actions
    Haptics: {},

    // App — handle deep links, back button
    App: {},

    // Browser — open external links
    Browser: {},
  },

  // iOS-specific
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'DealerSuite360',
    // These go in Info.plist via Xcode:
    // NSCameraUsageDescription: "Dealer Suite 360 needs camera access to photograph claim damage, scan unit tags, and update profile photos."
    // NSPhotoLibraryUsageDescription: "Dealer Suite 360 needs photo library access to upload claim photos and documents."
    // NSLocationWhenInUseUsageDescription: "Dealer Suite 360 uses your location for roadside assistance features."
  },

  // Android-specific
  android: {
    backgroundColor: '#0747fe',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // Set true for dev
  },
};

export default config;
