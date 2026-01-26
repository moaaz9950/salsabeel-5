import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'ramadan';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // Remove all theme classes first
    document.documentElement.classList.remove('light', 'dark', 'ramadan');
    
    // Add the current theme class
    document.documentElement.classList.add(theme);
    
    // Special handling for dark mode
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    
    // Apply Ramadan theme styles if selected
    if (theme === 'ramadan') {
      document.documentElement.style.setProperty('--primary-color', '#f59e0b');
      document.documentElement.style.setProperty('--background-color', '#fffbeb');
      document.documentElement.style.setProperty('--text-color', '#713f12');
    } else {
      // Reset to default theme colors
      document.documentElement.style.removeProperty('--primary-color');
      document.documentElement.style.removeProperty('--background-color');
      document.documentElement.style.removeProperty('--text-color');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'ramadan';
      return 'light';
    });
  };

  return { theme, toggleTheme, setTheme };
}