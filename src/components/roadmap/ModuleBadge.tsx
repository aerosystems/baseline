interface ModuleBadgeProps {
  title: string;
}

export function ModuleBadge({ title }: ModuleBadgeProps) {
  return (
    <div
      className="inline-block px-3 py-1.5 rounded font-semibold text-sm uppercase tracking-wide"
      style={{
        backgroundColor: 'var(--red)',
        color: 'var(--red-text)',
      }}
    >
      {title}
    </div>
  );
}
