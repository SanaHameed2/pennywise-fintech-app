import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';

type ThemeMode = 'light' | 'dark' | 'system';

export default function PreferencesTab() {
  // Safe SSR & Client initialization matching exact design system parameters
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pennywise-theme') as ThemeMode;
      return saved || 'system';
    }
    return 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = () => {
      // Clear existing states to ensure pure state sync
      root.classList.remove('light', 'dark');

      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(prefersDark ? 'dark' : 'light');
      } else {
        root.classList.add(theme);
      }
    };

    applyTheme();
    localStorage.setItem('pennywise-theme', theme);

    // Dynamic OS listener stream if system mode is explicitly targeted
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  const options = [
    { id: 'light', label: 'Light Mode', icon: Sun, desc: 'Clean high-contrast light setup' },
    { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Deep technical charcoal interface' },
    { id: 'system', label: 'System Sync', icon: Monitor, desc: 'Follow device environmental theme' },
  ] as const;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Preferences</h2>
        <p className="text-muted-foreground text-sm">Customize and map your system interface appearance</p>
      </div>

      {/* Modern, High-Signal 3-Way Segmented Grid System instead of clunky individual toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = theme === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-brand-primary bg-brand-primary/5 text-foreground'
                  : 'border-border bg-card/50 text-muted-foreground hover:text-foreground hover:border-foreground/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-brand-primary' : 'text-foreground/40'}`} />
                <span className="font-medium text-sm text-foreground">{option.label}</span>
              </div>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">{option.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Context Informational Feedback Block */}
      <div className="p-4 rounded-xl border border-border bg-card/30 text-xs text-muted-foreground/60">
        Note: Theme configuration state mutations are immediately bound to global layout DOM tokens for unified theme responsiveness across pages.
      </div>
    </div>
  );
}