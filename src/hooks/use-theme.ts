import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
const KEY = 'rozanapay_theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(KEY) as Theme;
    return saved || 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggle = () => setThemeState(prev => prev === 'light' ? 'dark' : 'light');

  return { theme, toggle };
}
