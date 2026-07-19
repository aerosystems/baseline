import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';

export function Header() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: 'var(--bg)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Title - aligned with roadmap rail */}
        <h1
          className="text-xl font-semibold"
          style={{ color: 'var(--ink)', paddingLeft: '40px' }}
        >
          {t('header.title')}
        </h1>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded transition-colors hover:opacity-80"
            title={theme === 'day' ? t('theme.night') : t('theme.day')}
            style={{ color: 'var(--ink)' }}
          >
            {theme === 'day' ? '☾' : '☀'}
          </button>
        </div>
      </div>
    </header>
  );
}
