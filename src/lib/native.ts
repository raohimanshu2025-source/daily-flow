import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';

export const isNative = () => Capacitor.isNativePlatform();
export const platform = () => Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

/** Initialize native-only behaviors. Safe no-op on web. */
export async function initNative() {
  if (!isNative()) return;
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#7C3AED' });
  } catch {}
  try {
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch {}

  // Android hardware back button: exit on root, else go back.
  try {
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) App.exitApp();
      else window.history.back();
    });
  } catch {}
}

/** Light haptic tap on tap targets — safe on web (no-op). */
export async function tap() {
  if (!isNative()) return;
  try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
}

/** Secure preference storage — uses Keychain (iOS) / EncryptedSharedPreferences (Android), localStorage on web. */
export const secureStore = {
  async get(key: string): Promise<string | null> {
    if (!isNative()) return localStorage.getItem(key);
    const { value } = await Preferences.get({ key });
    return value ?? null;
  },
  async set(key: string, value: string): Promise<void> {
    if (!isNative()) { localStorage.setItem(key, value); return; }
    await Preferences.set({ key, value });
  },
  async remove(key: string): Promise<void> {
    if (!isNative()) { localStorage.removeItem(key); return; }
    await Preferences.remove({ key });
  },
};