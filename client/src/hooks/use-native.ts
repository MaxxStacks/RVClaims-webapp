// client/src/hooks/use-native.ts — React hooks for Capacitor native features
// These hooks detect whether we're running in a native app (Capacitor) or browser,
// and provide the right implementation for each. In browser, they gracefully fallback.

import { useState, useEffect, useCallback } from 'react';

// ==================== PLATFORM DETECTION ====================

export type Platform = 'ios' | 'android' | 'web';

export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>('web');

  useEffect(() => {
    const detect = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        const p = Capacitor.getPlatform();
        setPlatform(p === 'ios' ? 'ios' : p === 'android' ? 'android' : 'web');
      } catch {
        setPlatform('web');
      }
    };
    detect();
  }, []);

  return platform;
}

export function useIsNative(): boolean {
  const platform = usePlatform();
  return platform !== 'web';
}

// ==================== CAMERA ====================

export interface CapturedPhoto {
  dataUrl: string;      // base64 data URL for display
  blob: Blob;           // Blob for uploading
  filename: string;     // generated filename
  width?: number;
  height?: number;
}

export function useCamera() {
  const platform = usePlatform();

  // Take a photo using native camera or file input fallback
  const takePhoto = useCallback(async (): Promise<CapturedPhoto | null> => {
    if (platform !== 'web') {
      // Native: use Capacitor Camera plugin
      try {
        const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
        const image = await Camera.getPhoto({
          quality: 85,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          width: 1920,
          height: 1440,
          correctOrientation: true,
        });

        if (!image.dataUrl) return null;

        // Convert data URL to blob
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();

        return {
          dataUrl: image.dataUrl,
          blob,
          filename: `claim-photo-${Date.now()}.${image.format || 'jpg'}`,
        };
      } catch (err) {
        console.error('Camera error:', err);
        return null;
      }
    } else {
      // Web: file input fallback
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) { resolve(null); return; }

          const dataUrl = await new Promise<string>((res) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result as string);
            reader.readAsDataURL(file);
          });

          resolve({
            dataUrl,
            blob: file,
            filename: file.name || `photo-${Date.now()}.jpg`,
          });
        };
        input.click();
      });
    }
  }, [platform]);

  // Pick from gallery
  const pickFromGallery = useCallback(async (multiple = false): Promise<CapturedPhoto[]> => {
    if (platform !== 'web') {
      try {
        if (multiple) {
          const { Camera } = await import('@capacitor/camera');
          const result = await Camera.pickImages({
            quality: 85,
            width: 1920,
            height: 1440,
            correctOrientation: true,
          });

          return Promise.all(result.photos.map(async (photo) => {
            const response = await fetch(photo.webPath);
            const blob = await response.blob();
            return {
              dataUrl: photo.webPath,
              blob,
              filename: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`,
            };
          }));
        } else {
          const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
          const image = await Camera.getPhoto({
            quality: 85,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Photos,
            width: 1920,
            height: 1440,
          });

          if (!image.dataUrl) return [];
          const response = await fetch(image.dataUrl);
          const blob = await response.blob();

          return [{
            dataUrl: image.dataUrl,
            blob,
            filename: `photo-${Date.now()}.${image.format || 'jpg'}`,
          }];
        }
      } catch {
        return [];
      }
    } else {
      // Web: file input with multiple
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = multiple;
        input.onchange = async () => {
          const files = Array.from(input.files || []);
          const photos = await Promise.all(files.map(async (file) => {
            const dataUrl = await new Promise<string>((res) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result as string);
              reader.readAsDataURL(file);
            });
            return { dataUrl, blob: file, filename: file.name };
          }));
          resolve(photos);
        };
        input.click();
      });
    }
  }, [platform]);

  return { takePhoto, pickFromGallery };
}

// ==================== PUSH NOTIFICATIONS ====================

export function usePushNotifications() {
  const platform = usePlatform();
  const [token, setToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const register = useCallback(async () => {
    if (platform === 'web') {
      // Web: use browser Notification API
      if ('Notification' in window) {
        const result = await Notification.requestPermission();
        setPermissionGranted(result === 'granted');
      }
      return;
    }

    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');

      // Request permission
      const permResult = await PushNotifications.requestPermissions();
      setPermissionGranted(permResult.receive === 'granted');

      if (permResult.receive === 'granted') {
        // Register with APNS/FCM
        await PushNotifications.register();

        // Listen for registration token
        PushNotifications.addListener('registration', (reg) => {
          setToken(reg.value);
          // TODO: Send token to your server
          console.log('Push token:', reg.value);
        });

        // Listen for push received while app is open
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received:', notification);
          // TODO: Show in-app notification
        });

        // Listen for push action (user tapped notification)
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('Push action:', action);
          // TODO: Navigate to relevant page
          const data = action.notification.data;
          if (data?.page) {
            window.dispatchEvent(new CustomEvent('navigate-page', { detail: data.page }));
          }
        });
      }
    } catch (err) {
      console.error('Push notification error:', err);
    }
  }, [platform]);

  return { register, token, permissionGranted };
}

// ==================== HAPTICS ====================

export function useHaptics() {
  const platform = usePlatform();

  const impact = useCallback(async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (platform === 'web') return;
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      const styleMap = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
      await Haptics.impact({ style: styleMap[style] });
    } catch {}
  }, [platform]);

  const notification = useCallback(async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (platform === 'web') return;
    try {
      const { Haptics, NotificationType } = await import('@capacitor/haptics');
      const typeMap = { success: NotificationType.Success, warning: NotificationType.Warning, error: NotificationType.Error };
      await Haptics.notification({ type: typeMap[type] });
    } catch {}
  }, [platform]);

  return { impact, notification };
}

// ==================== STATUS BAR ====================

export function useStatusBar() {
  const platform = usePlatform();

  const setDark = useCallback(async () => {
    if (platform === 'web') return;
    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#08235d' });
    } catch {}
  }, [platform]);

  const setLight = useCallback(async () => {
    if (platform === 'web') return;
    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    } catch {}
  }, [platform]);

  const hide = useCallback(async () => {
    if (platform === 'web') return;
    try {
      const { StatusBar } = await import('@capacitor/status-bar');
      await StatusBar.hide();
    } catch {}
  }, [platform]);

  return { setDark, setLight, hide };
}

// ==================== APP LIFECYCLE ====================

export function useAppLifecycle(callbacks?: {
  onResume?: () => void;
  onPause?: () => void;
  onBackButton?: () => boolean; // return true to prevent default
}) {
  const platform = usePlatform();

  useEffect(() => {
    if (platform === 'web') return;

    let cleanup: (() => void)[] = [];

    (async () => {
      try {
        const { App } = await import('@capacitor/app');

        if (callbacks?.onResume) {
          const listener = await App.addListener('appStateChange', (state) => {
            if (state.isActive) callbacks.onResume?.();
            else callbacks.onPause?.();
          });
          cleanup.push(() => listener.remove());
        }

        if (callbacks?.onBackButton) {
          const listener = await App.addListener('backButton', () => {
            const handled = callbacks.onBackButton?.();
            if (!handled) {
              // Default: go back in page history or minimize
              window.history.back();
            }
          });
          cleanup.push(() => listener.remove());
        }
      } catch {}
    })();

    return () => cleanup.forEach(fn => fn());
  }, [platform, callbacks]);
}

// ==================== KEYBOARD ====================

export function useKeyboard() {
  const platform = usePlatform();
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (platform === 'web') return;

    let cleanup: (() => void)[] = [];

    (async () => {
      try {
        const { Keyboard } = await import('@capacitor/keyboard');

        const showListener = await Keyboard.addListener('keyboardWillShow', (info) => {
          setIsOpen(true);
          setHeight(info.keyboardHeight);
        });
        cleanup.push(() => showListener.remove());

        const hideListener = await Keyboard.addListener('keyboardWillHide', () => {
          setIsOpen(false);
          setHeight(0);
        });
        cleanup.push(() => hideListener.remove());
      } catch {}
    })();

    return () => cleanup.forEach(fn => fn());
  }, [platform]);

  return { isOpen, height };
}

// ==================== NETWORK ====================

export function useNetwork() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const platform = usePlatform();

  useEffect(() => {
    // Browser fallback
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Native: richer info
    if (platform !== 'web') {
      (async () => {
        try {
          const { Network } = await import('@capacitor/network');
          const status = await Network.getStatus();
          setIsOnline(status.connected);
          setConnectionType(status.connectionType);

          Network.addListener('networkStatusChange', (s) => {
            setIsOnline(s.connected);
            setConnectionType(s.connectionType);
          });
        } catch {}
      })();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [platform]);

  return { isOnline, connectionType };
}

// ==================== SHARE ====================

export function useShare() {
  const platform = usePlatform();

  const share = useCallback(async (opts: { title: string; text?: string; url?: string }) => {
    if (platform !== 'web') {
      try {
        const { Share } = await import('@capacitor/share');
        await Share.share(opts);
        return true;
      } catch { return false; }
    } else if (navigator.share) {
      try {
        await navigator.share(opts);
        return true;
      } catch { return false; }
    }
    return false;
  }, [platform]);

  return { share };
}

// ==================== BIOMETRIC AUTH ====================

export function useBiometrics() {
  const platform = usePlatform();
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (platform === 'web') return;
    // Check if biometric auth is available
    // This requires @capacitor-community/biometric-auth or similar
    // For now, flag as available on native
    setAvailable(platform === 'ios' || platform === 'android');
  }, [platform]);

  return { available };
}
