import { useState, useEffect } from 'react'
import { api } from './api'
import MenuPage from './pages/MenuPage'
import GamePage from './pages/GamePage'
import ResultsPage from './pages/ResultsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import CreatorPage from './pages/CreatorPage'

export default function App() {
  const [view, setView] = useState(() =>
    window.location.pathname === '/questions' ? 'creator' : 'menu'
  )
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [gameQuestions, setGameQuestions] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [stats, setStats] = useState(null)
  const [session, setSession] = useState(null)
  useEffect(() => {
    init()
  }, [])

  async function init() {
    try {
      const [qs, st] = await Promise.all([
        api.getQuestions(),
        api.stats().catch(() => null),
      ])
      setQuestions(qs)
      if (st) setStats(st)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function startGame() {
    const byDifficulty = { low: [], medium: [], high: [] }
    questions.forEach((q) => {
      const d = q.difficulty || 'low'
      if (byDifficulty[d]) byDifficulty[d].push(q)
    })
    const easy = byDifficulty.low
    const medium = byDifficulty.medium
    const hard = byDifficulty.high
    if (easy.length < 4 || medium.length < 3 || hard.length < 3) {
      setError('Not enough questions. Need at least 4 low, 3 medium, and 3 high difficulty questions.')
      return
    }
    const randomSelect = (arr, n) => {
      const shuffled = [...arr].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, n)
    }
    const selected = [
      ...randomSelect(easy, 4),
      ...randomSelect(medium, 3),
      ...randomSelect(hard, 3),
    ].sort((a, b) => Math.random() - 0.5)
    setSession((s) => ({ index: 0, perQ: {}, finished: false, score: 0, correct: 0 }))
    setGameQuestions(selected)
    setView('game')
  }

  function handleAnswer(questionId, answerIndex, correct, timeScore) {
    setSession((s) => ({
      ...s,
      perQ: { ...s.perQ, [questionId]: { selected: answerIndex, correct, timeScore } },
    }))
  }

  function onAdvance() {
    setSession((s) => ({ ...s, index: s.index + 1 }))
  }

  function finishSession() {
    const total = gameQuestions.length
    const correctCount = Object.values(session.perQ).filter((p) => p.correct).length
    const score = Object.values(session.perQ)
      .filter((p) => p.correct)
      .reduce((sum, p) => sum + (p.timeScore || 0), 0)
    setSession((s) => ({ ...s, finished: true, correct: correctCount, score }))
    setView('results')
  }

  async function refreshLeaderboard(limit = 50) {
    try {
      setLeaderboard(await api.getLeaderboard(limit))
    } catch (e) {
      setLeaderboard([])
    }
  }

  function goLeaderboard() {
    refreshLeaderboard()
    setView('leaderboard')
  }

  async function clearLeaderboard() {
    try {
      await api.clearLeaderboard()
      setLeaderboard([])
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) return <LoadingScreen />
  if (error && view === 'menu') {
    return <ErrorScreen error={error} onRetry={init} />
  }

  return (
    <div className="y2k-bg min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {view === 'menu' && (
          <MenuPage
            onStart={startGame}
            onLeaderboard={goLeaderboard}
            questions={questions}
            stats={stats}
          />
        )}
        {view === 'game' && (
          <GamePage
            questions={gameQuestions}
            session={session}
            onAnswer={handleAnswer}
            onAdvance={onAdvance}
            onFinish={finishSession}
            onMenu={() => setView('menu')}
          />
        )}
        {view === 'results' && (
          <ResultsPage
            session={session}
            questions={gameQuestions}
            onMenu={() => setView('menu')}
            onLeaderboard={goLeaderboard}
            onPlayAgain={startGame}
          />
        )}
        {view === 'leaderboard' && (
          <LeaderboardPage
            scores={leaderboard}
            onBack={() => setView('menu')}
            onClear={clearLeaderboard}
          />
        )}
        {view === 'creator' && (
          <CreatorPage onBack={() => (window.location.href = '/')} onQuestionsChanged={init} />
        )}
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="y2k-bg min-h-screen flex items-center justify-center">
      <div className="font-pixel-lg text-3xl text-[var(--text-primary)] animate-pulse">
        LOADING…
      </div>
    </div>
  )
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div className="y2k-bg min-h-screen flex items-center justify-center p-4">
      <div className="y2k-window max-w-md w-full">
        <div className="y2k-title-bar">
          <div className="title-text">
            <span>SYSTEM ERROR</span>
          </div>
        </div>
        <div className="y2k-window-body space-y-4">
          <p className="font-pixel-lg text-lg text-[var(--wrong)]">{error}</p>
          <button className="y2k-btn" onClick={onRetry}>
            RETRY
          </button>
        </div>
      </div>
    </div>
  )
}
