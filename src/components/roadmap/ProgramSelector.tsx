import type { Program } from '@/types/content';

interface ProgramSelectorProps {
  programs: Program[];
  selected: string | null;
  onSelect: (programId: string | null) => void;
}

/**
 * Curriculum switcher. One subject is taught to several groups under different
 * curricula: lab numbers, hours and the delivery of a topic differ between them.
 * Picking a group shows the roadmap as that group sees it.
 */
export function ProgramSelector({ programs, selected, onSelect }: ProgramSelectorProps) {
  if (programs.length < 2) return null;

  const options: Array<{ id: string | null; label: string }> = [
    { id: null, label: 'Усі матеріали' },
    ...programs.map(program => ({ id: program.id, label: program.title })),
  ];

  return (
    <div className="mb-8">
      <div className="text-xs mb-2" style={{ color: 'var(--faint)' }}>
        Навчальна програма
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const active = option.id === selected;

          return (
            <button
              key={option.id ?? 'all'}
              onClick={() => onSelect(option.id)}
              className="text-sm px-3 py-1.5 rounded-md border transition-colors"
              style={{
                backgroundColor: active ? 'var(--red)' : 'var(--card)',
                borderColor: active ? 'var(--red)' : 'var(--border)',
                color: active ? 'var(--red-text)' : 'var(--ink)',
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
