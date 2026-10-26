import { useState, useEffect, useRef } from 'react'
import { Code2, ArrowRight, Check, X, Clock } from 'lucide-react'
import { Sparkle } from '../components/Decorations'
import Y2kWindow from '../components/Y2kWindow'
import ProgressBar from '../components/ProgressBar'
import AnswerOption from '../components/AnswerOption'
import Dialog from '../components/Dialog'
import { api } from '../api'

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const TIMER_MS = 30000 // 30 seconds

export default function GamePage({ questions, session, onAnswer, onAdvance, onFinish, onMenu }) {
  const q = questions[session.index]
  if (!q) return null
  const [selected, setSelected] = useState(session.perQ[q.id]?.selected)
  const [correct, setCorrect] = useState(session.perQ[q.id]?.correct)
  const [busy, setBusy] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_MS / 1000) // seconds
  const [timeScore, setTimeScore] = useState(0)
  const [timedOut, setTimedOut] = useState(false)
  const timerRef = useRef(null)
  const timeRef = useRef(TIMER_MS / 1000)
  const answeredRef = useRef(false)
  const selectedRef = useRef(session.perQ[q.id]?.selected)
  const correctRef = useRef(session.perQ[q.id]?.correct)
  // Keep local answer state in sync when the question index changes.
  useEffect(() => {
    setSelected(session.perQ[q.id]?.selected)
    setCorrect(session.perQ[q.id]?.correct)
    setBusy(false)
    selectedRef.current = session.perQ[q.id]?.selected
    correctRef.current = session.perQ[q.id]?.correct
  }, [q.id])

  // Countdown timer: 30 seconds per question, resets on question change.
  useEffect(() => {
    const initialTime = TIMER_MS / 1000
    timeRef.current = initialTime
    setTimeLeft(initialTime)
    setTimedOut(false)
    setTimeScore(0)
    setBusy(false)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      timeRef.current = timeRef.current - 1
      setTimeLeft(timeRef.current)
      if (timeRef.current <= 0) {
        clearInterval(timerRef.current)
        // Use setTimeout to avoid setState during render
        setTimeout(() => {
          if (!answeredRef.current) {
            setBusy(true)
            setTimedOut(true)
            onAnswer(q.id, -1, false, 0)
            setSelected(-1)
            setCorrect(false)
            answeredRef.current = true
          }
        }, 0)
      }
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [q.id])

  // Backend answers carry `is_correct`; derive the correct index once.
  const correctIdx = q.answers.findIndex((a) => a.is_correct)

  function optionState(idx) {
    if (!answeredRef.current) return 'idle'
    if (idx === selectedRef.current) return correctRef.current ? 'correct' : 'wrong'
    if (!correctRef.current && idx === correctIdx) return 'correct'
    return 'idle'
  }

  async function pick(idx) {
    if (busy || answeredRef.current) return
    setBusy(true)
    // Clear timer when user answers
    clearInterval(timerRef.current)
    const ts = Math.round(100 * (timeRef.current / 30))
    setTimeScore(ts)
    const res = await api.checkAnswer(q.id, idx)
    const isCorrect = Boolean(res.correct)
    onAnswer(q.id, idx, isCorrect, ts)
    setCorrect(isCorrect)
    selectedRef.current = idx
    correctRef.current = isCorrect
    setBusy(false)
  }

  function goNext() {
    if (session.index >= questions.length - 1) {
      onFinish()
    } else {
      onAdvance()
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
      <Y2kWindow title={`GUESS THE OUTPUT · #${session.index + 1}`} titleIcon={<Code2 size={12} />}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[var(--text-primary)]">
            <Clock size={16} />
            <span className="font-pixel-lg text-lg">{timeLeft}s</span>
          </div>
           <ProgressBar current={session.index} total={questions.length} />
          <div>
            <p className="y2k-label mb-2">What does this program output?</p>
            <div className="y2k-code">{q.snippet}</div>
          </div>

          <div className="space-y-2">
            {q.answers.map((a, idx) => (
              <AnswerOption
                key={idx}
                label={KEYS[idx] || String(idx + 1)}
                text={a.text}
                state={optionState(idx)}
                disabled={answeredRef.current}
                onClick={() => pick(idx)}
              />
            ))}
          </div>

          {answeredRef.current && (
            <div className="space-y-3">
              <p
                className={`font-pixel-lg text-lg ${
                  correct ? 'text-[var(--correct)]' : 'text-[var(--wrong)]'
                } flex items-center gap-2`}
              >
                {correct ? (
                  <>
                    <Check size={18} /> CORRECT! +{timeScore} PTS
                  </>
                ) : timedOut ? (
                  <>
                    <X size={18} /> OUT OF TIME
                  </>
                ) : (
                  <>
                    <X size={18} /> WRONG. OUTPUT: {q.answers[correctIdx]?.text}
                  </>
                )}
              </p>
              <div className="flex justify-end">
                <button className="y2k-btn" onClick={goNext}>
                  {session.index >= questions.length - 1 ? 'FINISH' : 'NEXT'}{' '}
                  <ArrowRight size={14} className="inline" />
                </button>
              </div>
            </div>
          )}
        </div>
      </Y2kWindow>
      {confirmExit && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
          <Dialog
            title="EXIT GAME?"
            message="Your progress will be lost."
            actions={
              <>
                <button className="y2k-btn btn-ghost" onClick={() => setConfirmExit(false)}>
                  CONTINUE
                </button>
                <button className="y2k-btn btn-danger" onClick={onMenu}>
                  EXIT
                </button>
              </>
            }
          />
        </div>
      )}
    </div>

    <div className="flex justify-end">
      <button className="y2k-btn btn-ghost text-[8px]" onClick={() => setConfirmExit(true)}>
        EXIT
      </button>
    </div>
  </div>
)
}
