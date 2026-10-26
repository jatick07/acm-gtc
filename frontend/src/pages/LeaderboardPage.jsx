import { Trophy, ArrowLeft, Trash2 } from 'lucide-react'
import { Sparkle } from '../components/Decorations'
import Y2kWindow from '../components/Y2kWindow'

export default function LeaderboardPage({ scores, onBack, onClear }) {
  return (
    <div className="space-y-4">
      <button className="y2k-btn btn-ghost text-[8px]" onClick={onBack}>
        <ArrowLeft size={14} className="inline" /> MENU
      </button>

      <Y2kWindow title="★ LEADERBOARD ★" titleIcon={<Trophy size={12} />}>
        {scores.length === 0 ? (
          <p className="font-pixel-lg text-lg text-[var(--text-muted)]">
            No scores yet. Be the first on the board!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="y2k-label text-left border-b-2 border-[var(--border)]">
                  <th className="px-2 py-2 w-12">#</th>
                  <th className="px-2 py-2">NAME</th>
                  <th className="px-2 py-2 text-right">SCORE</th>
                  <th className="px-2 py-2 text-right">SOLVED</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-b-2 border-[var(--border)] ${
                      i % 2 ? 'bg-[color:var(--brand-xlight)]/40' : ''
                    }`}
                  >
                    <td className="px-2 py-2 font-pixel text-[9px]">
                      {i === 0 ? '★' : i + 1}
                    </td>
                    <td className="px-2 py-2 font-bold">{s.player_name}</td>
                    <td className="px-2 py-2 font-pixel text-[10px] text-right">{s.score}</td>
                    <td className="px-2 py-2 text-right text-[var(--text-muted)]">
                      {s.correct_count}/{s.total_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {scores.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button className="y2k-btn btn-danger text-[8px]" onClick={onClear}>
              <Trash2 size={12} className="inline" /> CLEAR BOARD
            </button>
          </div>
        )}
      </Y2kWindow>
    </div>
  )
}
