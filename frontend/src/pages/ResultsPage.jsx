import { useState } from 'react'
import { Trophy, RotateCcw, ArrowLeft, Home, Check } from 'lucide-react'
import { Sparkle, PixelHeart } from '../components/Decorations'
import Y2kWindow from '../components/Y2kWindow'
import { api } from '../api'

export default function ResultsPage({ session, questions, onMenu, onLeaderboard, onPlayAgain }) {
  const correctCount = Object.values(session.perQ).filter((p) => p.correct).length
  const total = questions.length
  const score = session.score || 0
  const pct = total === 0 ? 0 : Math.round((correctCount / total) * 100)

  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Enter your name to enter the scoreboard!')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await api.submitScore(trimmed, score, correctCount, total)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Y2kWindow title="RESULTS" titleIcon={<Sparkle size={14} className="text-[var(--sparkle)]" />}>
        <div className="flex flex-col items-center gap-4 text-center py-2">
          <Trophy size={48} className="text-[var(--title-bar)]" />
          <div className="relative">
            <h2 className="font-pixel text-lg md:text-xl text-[var(--text-primary)]">
              {correctCount === total ? 'PERFECT!' : pct >= 50 ? 'NICE WORK!' : 'GAME OVER'}
            </h2>
            <Sparkle
              size={16}
              className="text-[var(--sparkle)] absolute -top-4 -right-8 animate-[sparkle-spin_3s_linear_infinite]"
            />
            <PixelHeart
              size={20}
              className="text-[var(--sparkle)] absolute -bottom-2 -left-10 animate-[sparkle-spin_4s_linear_infinite]"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-2 w-full max-w-sm text-center font-pixel text-[9px]">
            <div>
              <div className="text-[var(--title-bar)] text-2xl">{score}</div>
              <div className="y2k-label mt-2">SCORE</div>
            </div>
            <div>
              <div className="text-[var(--title-bar)] text-2xl">{correctCount}</div>
              <div className="y2k-label mt-2">SOLVED</div>
            </div>
            <div>
              <div className="text-[var(--text-muted)] text-2xl">{total}</div>
              <div className="y2k-label mt-2">TOTAL</div>
            </div>
          </div>
        </div>
      </Y2kWindow>

      <Y2kWindow title="ENTER THE LEADERBOARD" titleIcon={<Check size={12} />}>
        {saved ? (
          <div className="flex flex-col items-center gap-4 text-center py-2">
            <p className="font-pixel-lg text-lg text-[var(--correct)]">SCORE SAVED!</p>
            <div className="flex gap-2">
              <button className="y2k-btn" onClick={onLeaderboard}>
                VIEW LEADERBOARD
              </button>
              <button className="y2k-btn btn-ghost" onClick={onPlayAgain}>
                PLAY AGAIN
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <label className="y2k-label">YOUR NAME</label>
            <input
              className="y2k-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type your name…"
              autoFocus
            />
            {error && (
              <p className="text-[var(--wrong)] font-semibold text-sm">{error}</p>
            )}
            <div className="flex justify-end">
              <button className="y2k-btn" type="submit" disabled={submitting}>
                SUBMIT SCORE
              </button>
            </div>
          </form>
        )}
      </Y2kWindow>

      {!saved && (
        <div className="flex justify-between">
          <button className="y2k-btn btn-ghost" onClick={onMenu}>
            <ArrowLeft size={14} className="inline" /> MENU
          </button>
          <button className="y2k-btn btn-ghost" onClick={onPlayAgain}>
            <RotateCcw size={14} className="inline" /> PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  )
}
