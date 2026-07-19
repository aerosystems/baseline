import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { OsStackDiagram } from './OsStackDiagram';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) => {
            // Use inline SVG for os-stack diagram (supports theming)
            if (src?.includes('os-stack.svg')) {
              return (
                <figure className="my-6">
                  <OsStackDiagram />
                  {alt && (
                    <figcaption
                      className="text-center text-sm mt-2 italic"
                      style={{ color: 'var(--muted)' }}
                    >
                      {alt}
                    </figcaption>
                  )}
                </figure>
              );
            }
            return (
              <img
                src={src}
                alt={alt}
                className="rounded-lg max-w-full h-auto"
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
