// Simple theme utility - no React context needed
export type Theme = "light" | "dark" | "auto";

export function setTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  
  console.log('🎨 Setting theme to:', theme);
  
  const root = document.documentElement;
  
  // Save to localStorage first
  localStorage.setItem('theme', theme);
  
  if (theme === 'auto') {
    // Use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      console.log('🤖 AUTO mode - System prefers DARK');
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      console.log('🤖 AUTO mode - System prefers LIGHT');
    }
  } else if (theme === 'dark') {
    // Force dark mode
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
    console.log('🌙 DARK mode activated - added "dark" class');
  } else {
    // Force light mode
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
    console.log('☀️ LIGHT mode activated - removed "dark" class');
  }
  
  console.log('✅ Theme saved to localStorage');
  console.log('📋 HTML classes:', root.className);
  console.log('📋 Has dark class?', root.classList.contains('dark'));
}

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') return 'dark';
  if (saved === 'auto') return 'auto';
  return 'light';
}

export function initTheme() {
  if (typeof window === 'undefined') return;
  
  const theme = getTheme();
  setTheme(theme);
  
  console.log('🚀 Theme initialized:', theme);
  
  // Listen for system theme changes when in auto mode
  if (theme === 'auto') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const currentTheme = getTheme();
      if (currentTheme === 'auto') {
        setTheme('auto'); // Re-apply auto theme
      }
    });
  }
}
