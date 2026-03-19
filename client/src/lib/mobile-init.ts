// client/src/lib/mobile-init.ts — Initialize native app features on startup
// Call this once from App.tsx or main.tsx

export async function initMobileApp() {
  // Only run in Capacitor environment
  let isNative = false;
  try {
    const { Capacitor } = await import('@capacitor/core');
    isNative = Capacitor.isNativePlatform();
  } catch {
    return; // Not in Capacitor, skip all native init
  }

  if (!isNative) return;

  // === Status Bar ===
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    const theme = localStorage.getItem('ds360-theme');
    if (theme === 'dark') {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0f1117' });
    } else {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#08235d' });
    }
  } catch {}

  // === Splash Screen ===
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    // Hide after app is ready (give React time to mount)
    setTimeout(() => SplashScreen.hide(), 500);
  } catch {}

  // === Keyboard ===
  try {
    const { Keyboard } = await import('@capacitor/keyboard');
    // Scroll to focused input when keyboard opens
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-open');
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-open');
    });
  } catch {}

  // === Deep Links ===
  try {
    const { App } = await import('@capacitor/app');
    App.addListener('appUrlOpen', (event) => {
      // Handle deep links: rvclaims://claims/CLM-0248
      const url = new URL(event.url);
      const path = url.pathname;
      if (path) {
        window.location.hash = path;
      }
    });
  } catch {}

  // === Prevent accidental back-exit on Android ===
  try {
    const { App } = await import('@capacitor/app');
    let lastBack = 0;
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        // Double-tap to exit
        const now = Date.now();
        if (now - lastBack < 2000) {
          App.exitApp();
        } else {
          lastBack = now;
          // TODO: Show toast "Press back again to exit"
        }
      }
    });
  } catch {}

  // === Safe Area CSS Variables ===
  // Capacitor sets env(safe-area-inset-*) but we also add CSS vars for flexibility
  const safeAreaStyle = document.createElement('style');
  safeAreaStyle.textContent = `
    :root {
      --safe-top: env(safe-area-inset-top, 0px);
      --safe-bottom: env(safe-area-inset-bottom, 0px);
      --safe-left: env(safe-area-inset-left, 0px);
      --safe-right: env(safe-area-inset-right, 0px);
    }
  `;
  document.head.appendChild(safeAreaStyle);

  console.log('[RVClaims] Native app initialized');
}

// === Theme Sync ===
// Call this when theme changes to update status bar
export async function syncNativeTheme(isDark: boolean) {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) return;

    const { StatusBar, Style } = await import('@capacitor/status-bar');
    if (isDark) {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0f1117' });
    } else {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#08235d' });
    }
  } catch {}
}
