import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Tenta recuperar do localStorage, se não existir usa 'system'
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  // Detecta o tema do sistema
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  
  // Aplica o tema
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Se for 'system', usa o tema do sistema
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    
    // Remove ambas as classes e adiciona a correta
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    
    // Salva no localStorage
    localStorage.setItem('theme', theme);
  }, [theme, systemTheme]);

  // Escuta mudanças no tema do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const root = window.document.documentElement;
        const newTheme = mediaQuery.matches ? 'dark' : 'light';
        root.classList.remove('light', 'dark');
        root.classList.add(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return {
    theme,
    setTheme,
    systemTheme,
    isDark: theme === 'system' ? systemTheme === 'dark' : theme === 'dark'
  };
}
