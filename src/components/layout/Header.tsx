import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from '@/types/content';

interface HeaderProps {
  onLanguageChange?: (lang: Language) => void;
}

export function Header({ onLanguageChange }: HeaderProps) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    onLanguageChange?.(lang);
  };

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: 'var(--bg)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Title */}
        <h1 className="text-xl font-semibold" style={{ color: 'var(--ink)' }}>
          {t('header.title')}
        </h1>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Language Switch */}
          <div
            className="flex border-2 rounded overflow-hidden"
            style={{ borderColor: 'var(--rail)' }}
          >
            <button
              onClick={() => handleLanguageChange('uk')}
              className="px-2 py-1 text-sm font-medium transition-colors"
              style={{
                backgroundColor: language === 'uk' ? 'var(--rail)' : 'transparent',
                color: language === 'uk' ? 'var(--bg)' : 'var(--ink)',
              }}
            >
              UK
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className="px-2 py-1 text-sm font-medium transition-colors"
              style={{
                backgroundColor: language === 'en' ? 'var(--rail)' : 'transparent',
                color: language === 'en' ? 'var(--bg)' : 'var(--ink)',
              }}
            >
              EN
            </button>
          </div>

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
