import { Play, Trophy, Database } from 'lucide-react'
import { Sparkle, PixelHeart } from '../components/Decorations'
import Y2kWindow from '../components/Y2kWindow'

export default function MenuPage({ onStart, onLeaderboard, questions, stats }) {
  return (
    <div className="space-y-6">
      <Y2kWindow
        title="ACM Guess the Output"
        titleIcon={<Sparkle size={14} className="text-[var(--sparkle)]" />}
        className="relative"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative py-2">
            <h1 className="font-pixel text-base md:text-lg leading-relaxed text-[var(--text-primary)]">
              ACM GUESS THE OUTPUT
            </h1>
            <Sparkle
              size={18}
              className="text-[var(--sparkle)] absolute -top-5 -right-10 animate-[sparkle-spin_3s_linear_infinite]"
            />
            <PixelHeart
              size={24}
              className="text-[var(--sparkle)] absolute -bottom-1 -left-10 animate-[sparkle-spin_3.6s_linear_infinite]"
            />
          </div>
          <p className="text-sm text-[var(--text-muted)] font-semibold">
            Read the code. Guess the output. Beat the scoreboard.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <button className="y2k-btn" onClick={onStart}>
              <Play size={14} className="inline" /> PLAY
            </button>
            <button className="y2k-btn btn-ghost" onClick={onLeaderboard}>
              <Trophy size={14} className="inline" /> LEADERBOARD
            </button>
          </div>
        </div>
      </Y2kWindow>

      {stats && stats.total_questions > 0 && (
        <Y2kWindow title="SYSTEM STATUS" titleIcon={<Database size={12} />} className="text-sm">
          <div className="grid grid-cols-3 gap-4 text-center font-pixel text-[9px]">
            <div>
              <div className="text-[var(--title-bar)] text-lg">{stats.total_questions}</div>
              <div className="y2k-label mt-1">Questions</div>
            </div>
            <div>
              <div className="text-[var(--title-bar)] text-lg">{stats.total_scores}</div>
              <div className="y2k-label mt-1">Games Played</div>
            </div>
            <div>
              <div className="text-[var(--text-muted)] text-lg">{questions.length}</div>
              <div className="y2k-label mt-1">Loaded</div>
            </div>
          </div>
        </Y2kWindow>
      )}
    </div>
  )
}
