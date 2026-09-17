import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface LabMetadataProps {
  duration?: string;
  equipment?: string[];
  docxPath?: string;
}

// Resolve a public/ path against the deployment base (e.g. /baseline/)
function resolveFileUrl(filePath: string): string {
  const base = window.location.origin + import.meta.env.BASE_URL;
  return new URL(filePath.replace(/^\//, ''), base).href;
}

// Construct Google Docs viewer URL for a file
function getGoogleDocsUrl(docxPath: string): string {
  return `https://docs.google.com/viewer?url=${encodeURIComponent(resolveFileUrl(docxPath))}`;
}

export function LabMetadata({ duration, equipment, docxPath }: LabMetadataProps) {
  const { t } = useTranslation();

  const googleDocsUrl = useMemo(() => {
    if (!docxPath) return undefined;
    return getGoogleDocsUrl(docxPath);
  }, [docxPath]);

  const downloadUrl = useMemo(() => {
    if (!docxPath) return undefined;
    return resolveFileUrl(docxPath);
  }, [docxPath]);

  // Name the saved file explicitly: the URL is percent-encoded Cyrillic
  const downloadName = useMemo(() => {
    if (!docxPath) return undefined;
    return decodeURIComponent(docxPath.split('/').pop() ?? '');
  }, [docxPath]);

  return (
    <div
      className="flex flex-wrap items-center gap-4 p-4 rounded-lg mb-6 text-sm"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Duration */}
      {duration && (
        <div className="flex items-center gap-2" style={{ color: 'var(--muted)' }}>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path strokeLinecap="round" strokeWidth="2" d="M12 6v6l4 2" />
          </svg>
          <span>{duration}</span>
        </div>
      )}

      {/* Equipment */}
      {equipment && equipment.length > 0 && (
        <div className="flex items-center gap-2" style={{ color: 'var(--muted)' }}>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" />
            <path strokeWidth="2" d="M8 21h8M12 17v4" />
          </svg>
          <span>
            {equipment[0]}
            {equipment.length > 1 && (
              <span style={{ color: 'var(--muted)', opacity: 0.7 }}>
                {' '}+{equipment.length - 1}
              </span>
            )}
          </span>
        </div>
      )}

      {/* Action buttons */}
      {docxPath && (
        <div className="flex items-center gap-2 ml-auto">
          {/* Google Docs button */}
          <a
            href={googleDocsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--red)';
              e.currentTarget.style.color = 'var(--red)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--ink)';
            }}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
              <path d="M8 12h8v2H8zM8 16h5v2H8z"/>
            </svg>
            <span>{t('lab.openInGoogleDocs', 'Google Docs')}</span>
          </a>

          {/* Download button */}
          <a
            href={downloadUrl}
            download={downloadName}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-semibold transition-opacity"
            style={{
              backgroundColor: 'var(--red)',
              color: 'var(--red-text)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.85';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>{t('lab.download', 'Завантажити')}</span>
          </a>
        </div>
      )}
    </div>
  );
}
