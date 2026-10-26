export default function ProgressBar({ current, total }) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100)
  return (
    <div>
      <div className="y2k-progress-track w-full">
        <div
          className="y2k-progress-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="y2k-label mt-2">
        {Math.min(current + 1, total)} / {total}
      </p>
    </div>
  )
}
