export function OsStackDiagram() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 280"
      className="w-full max-w-md mx-auto my-6"
      style={{ display: 'block' }}
    >
      <defs>
        <marker id="arrow-diagram" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 L2,4 Z" style={{ fill: 'var(--ink)' }} />
        </marker>
      </defs>

      {/* User layer */}
      <rect
        x="100" y="15" width="200" height="40" rx="6"
        style={{ fill: 'var(--bg)', stroke: 'var(--ink)', strokeWidth: 2 }}
      />
      <text
        x="200" y="35"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fill: 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}
      >
        Користувач
      </text>

      {/* Arrow: User -> Apps */}
      <line
        x1="200" y1="58" x2="200" y2="72"
        style={{ stroke: 'var(--ink)', strokeWidth: 2 }}
        markerEnd="url(#arrow-diagram)"
      />

      {/* Applications layer */}
      <rect
        x="50" y="80" width="300" height="50" rx="6"
        style={{ fill: 'var(--card)', stroke: 'var(--ink)', strokeWidth: 2 }}
      />
      <text
        x="200" y="105"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fill: 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}
      >
        Прикладні програми
      </text>

      {/* Arrow: Apps -> OS */}
      <line
        x1="200" y1="133" x2="200" y2="147"
        style={{ stroke: 'var(--ink)', strokeWidth: 2 }}
        markerEnd="url(#arrow-diagram)"
      />

      {/* OS layer (red - highlight) */}
      <rect
        x="50" y="155" width="300" height="50" rx="6"
        style={{ fill: 'var(--red)', stroke: 'var(--ink)', strokeWidth: 2 }}
      />
      <text
        x="200" y="180"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fill: 'var(--red-text)', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600 }}
      >
        Операційна система
      </text>

      {/* Arrow: OS -> Hardware */}
      <line
        x1="200" y1="208" x2="200" y2="222"
        style={{ stroke: 'var(--ink)', strokeWidth: 2 }}
        markerEnd="url(#arrow-diagram)"
      />

      {/* Hardware layer */}
      <rect
        x="50" y="230" width="300" height="50" rx="6"
        style={{ fill: 'var(--faint)', stroke: 'var(--ink)', strokeWidth: 2 }}
      />
      <text
        x="200" y="255"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fill: 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}
      >
        Апаратне забезпечення
      </text>
    </svg>
  );
}
