import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { OsStackDiagram } from './OsStackDiagram';

interface MarkdownRendererProps {
  content: string;
}

function CodeBlock({ children, className }: { children: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          backgroundColor: 'var(--faint)',
          color: 'var(--code-ink)',
        }}
      >
        {copied ? '✓' : 'Copy'}
      </button>
      <pre className={className}>
        <code>{children}</code>
      </pre>
    </div>
  );
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
          pre: ({ children }) => {
            // Extract code content from children
            const codeElement = children as React.ReactElement<{ children?: string; className?: string }>;
            const codeContent = codeElement?.props?.children || '';
            const className = codeElement?.props?.className || '';

            return (
              <CodeBlock className={className}>
                {String(codeContent)}
              </CodeBlock>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
