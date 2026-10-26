// Hand-coded pixel decorations (no image embeds, no emoji).

// 4-pointed sparkle star: two crossed rotated bars + diamond core.
export function Sparkle({ size = 20, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 1 L13.6 10.6 L23 12 L13.6 13.4 L12 23 L10.4 13.4 L1 12 L10.4 10.6 Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Pixel heart built from a 6x5 grid of filled cells.
const HEART = [
  [0, 1, 1, 0, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 0, 0],
]
export function PixelHeart({ size = 24, className = '' }) {
  const cell = size / 6
  return (
    <svg
      viewBox={`0 0 ${size} ${size * 0.833}`}
      width={size}
      height={size * 0.833}
      className={className}
      aria-hidden="true"
    >
      {HEART.map((row, y) =>
        row.map((cellOn, x) =>
          cellOn ? (
            <rect
              key={`${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill="currentColor"
            />
          ) : null,
        ),
      )}
    </svg>
  )
}

// Pixel cloud: overlapping squares.
export function PixelCloud({ size = 40, className = '' }) {
  return (
    <svg
      viewBox="0 0 48 24"
      width={size}
      height={size * 0.5}
      className={className}
      aria-hidden="true"
    >
      <g fill="currentColor">
        <rect x="4" y="14" width="8" height="8" />
        <rect x="12" y="10" width="8" height="8" />
        <rect x="20" y="6" width="12" height="8" />
        <rect x="32" y="10" width="8" height="8" />
        <rect x="28" y="14" width="8" height="8" />
        <rect x="8" y="16" width="32" height="4" />
      </g>
    </svg>
  )
}
