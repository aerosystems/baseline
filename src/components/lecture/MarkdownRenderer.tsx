import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
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
        {copied ? '✓' : 'Копіювати'}
      </button>
      <pre className={className}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

function HeadingWithAnchor({
  level,
  id,
  children,
}: {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  id?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const Tag = `h${level}` as const;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;

    const basePath = window.location.hash.split('::')[0];
    const fullUrl = `${window.location.origin}${window.location.pathname}${basePath}::${id}`;

    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHeadingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!id) return;

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      const basePath = window.location.hash.split('::')[0];
      window.history.replaceState(null, '', `${basePath}::${id}`);
    }
  };

  if (!id) {
    return <Tag>{children}</Tag>;
  }

  return (
    <Tag id={id} className="group">
      <a
        href={`#${id}`}
        onClick={handleHeadingClick}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        {children}
      </a>
      <span
        onClick={handleCopyLink}
        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer select-none"
        style={{ color: 'var(--muted)' }}
        title="Копіювати посилання"
      >
        {copied ? '✓' : '#'}
      </span>
    </Tag>
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const handleAnchorClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Internal anchor link within same page: #section
    if (href.startsWith('#') && !href.startsWith('#/')) {
      e.preventDefault();
      const anchor = href.slice(1);
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Update URL without triggering navigation
        const currentHash = window.location.hash;
        const basePath = currentHash.split('::')[0];
        window.history.replaceState(null, '', `${basePath}::${anchor}`);
      }
      return;
    }

    // Cross-document anchor link: #/path/to/lesson::section
    if (href.startsWith('#/') && href.includes('::')) {
      e.preventDefault();
      window.location.hash = href;
      return;
    }
  }, []);

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          h1: ({ id, children }) => <HeadingWithAnchor level={1} id={id}>{children}</HeadingWithAnchor>,
          h2: ({ id, children }) => <HeadingWithAnchor level={2} id={id}>{children}</HeadingWithAnchor>,
          h3: ({ id, children }) => <HeadingWithAnchor level={3} id={id}>{children}</HeadingWithAnchor>,
          h4: ({ id, children }) => <HeadingWithAnchor level={4} id={id}>{children}</HeadingWithAnchor>,
          h5: ({ id, children }) => <HeadingWithAnchor level={5} id={id}>{children}</HeadingWithAnchor>,
          h6: ({ id, children }) => <HeadingWithAnchor level={6} id={id}>{children}</HeadingWithAnchor>,
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
          a: ({ href, children }) => {
            const isAnchorLink = href?.startsWith('#');
            return (
              <a
                href={href}
                onClick={isAnchorLink ? (e) => handleAnchorClick(e, href!) : undefined}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
