import { useTranslation } from 'react-i18next';

export function Legend() {
  const { t } = useTranslation();

  return (
    <div
      className="mt-12 pt-8 border-t"
      style={{ borderColor: 'var(--border)' }}
    >
      <h3
        className="text-sm font-semibold mb-4 uppercase tracking-wide"
        style={{ color: 'var(--muted)' }}
      >
        {t('legend.title')}
      </h3>

      <div className="flex flex-wrap gap-6">
        {/* Lecture */}
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border-3"
            style={{
              borderColor: 'var(--rail)',
              backgroundColor: 'var(--bg)',
              borderWidth: '3px',
            }}
          />
          <span className="text-sm" style={{ color: 'var(--ink)' }}>
            {t('legend.lecture')}
          </span>
        </div>

        {/* Lab */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <div
              className="w-4 h-0.5"
              style={{ backgroundColor: 'var(--faint)' }}
            />
            <div
              className="w-3 h-3 rounded-full border-2"
              style={{
                borderColor: 'var(--faint)',
                backgroundColor: 'var(--bg)',
              }}
            />
          </div>
          <span className="text-sm" style={{ color: 'var(--ink)' }}>
            {t('legend.lab')}
          </span>
        </div>

        {/* Event (seminar/test) */}
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rotate-45"
            style={{ backgroundColor: 'var(--red)' }}
          />
          <span className="text-sm" style={{ color: 'var(--ink)' }}>
            {t('legend.event')}
          </span>
        </div>
      </div>
    </div>
  );
}
