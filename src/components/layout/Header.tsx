import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  showBack?: boolean;
  onBackClick?: () => void;
}

export function Header({ showBack, onBackClick }: HeaderProps) {
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
        {showBack ? (
          <button
            onClick={onBackClick}
            className="text-xl font-semibold transition-colors hover:opacity-80"
            style={{ color: 'var(--ink)', paddingLeft: '40px' }}
          >
            ← Baseline
          </button>
        ) : (
          <h1
            className="text-xl font-semibold"
            style={{ color: 'var(--ink)', paddingLeft: '40px' }}
          >
            Baseline
          </h1>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded transition-colors hover:opacity-80"
            title={theme === 'day' ? 'Нічна тема' : 'Денна тема'}
            style={{ color: 'var(--ink)' }}
          >
            {theme === 'day' ? '☾' : '☀'}
          </button>
        </div>
      </div>
    </header>
  );
}
