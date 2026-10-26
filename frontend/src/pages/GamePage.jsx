import { useState, useEffect, useRef } from 'react'
import { Code2, ArrowRight, Check, X, Clock } from 'lucide-react'
import Y2kWindow from '../components/Y2kWindow'
import ProgressBar from '../components/ProgressBar'
import AnswerOption from '../components/AnswerOption'
import Dialog from '../components/Dialog'
import { api } from '../api'

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const TIMER_SECONDS = 30

export default function GamePage({ questions, session, onAnswer, onAdvance, onFinish, onMenu }) {
  const q = questions ? questions[session.index] : null
  const qId = q?.id
  const currentAnswer = session?.perQ?.[qId]
  const isAnswered = Boolean(currentAnswer)

  const [busy, setBusy] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)

  const isAnsweredRef = useRef(isAnswered)
  useEffect(() => {
    isAnsweredRef.current = isAnswered
  }, [isAnswered])

  const timeLeftRef = useRef(TIMER_SECONDS)

  // Countdown timer: 30 seconds per question, resets on question change.
  useEffect(() => {
    timeLeftRef.current = TIMER_SECONDS
    setTimeLeft(TIMER_SECONDS)
    setBusy(false)

    if (isAnsweredRef.current) {
      return
    }

    const interval = setInterval(() => {
      if (isAnsweredRef.current) {
        clearInterval(interval)
        return
      }

      timeLeftRef.current -= 1
      setTimeLeft(timeLeftRef.current)

      if (timeLeftRef.current <= 0) {
        clearInterval(interval)
        if (!isAnsweredRef.current && qId !== undefined) {
          isAnsweredRef.current = true
          onAnswer(qId, -1, false, 0)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [qId, onAnswer])

  if (!q) return null

  const selectedIdx = currentAnswer?.selected
  const isCorrect = Boolean(currentAnswer?.correct)
  const timeScore = currentAnswer?.timeScore ?? 0
  const timedOut = selectedIdx === -1
  const correctIdx = q.answers.findIndex((a) => a.is_correct)

  function optionState(idx) {
    if (!isAnswered) return 'idle'
    if (idx === selectedIdx) return isCorrect ? 'correct' : 'wrong'
    if (!isCorrect && idx === correctIdx) return 'correct'
    return 'idle'
  }

  async function pick(idx) {
    if (busy || isAnswered || isAnsweredRef.current) return
    isAnsweredRef.current = true
    setBusy(true)

    const remaining = Math.max(0, timeLeftRef.current)
    const ts = Math.round(100 * (remaining / TIMER_SECONDS))

    try {
      const res = await api.checkAnswer(q.id, idx)
      const correct = Boolean(res.correct)
      onAnswer(q.id, idx, correct, ts)
    } catch (err) {
      console.error('Failed to check answer:', err)
      isAnsweredRef.current = false
    } finally {
      setBusy(false)
    }
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
                  disabled={isAnswered || busy}
                  onClick={() => pick(idx)}
                />
              ))}
            </div>

            {isAnswered && (
              <div className="space-y-3">
                <p
                  className={`font-pixel-lg text-lg ${
                    isCorrect ? 'text-[var(--correct)]' : 'text-[var(--wrong)]'
                  } flex items-center gap-2`}
                >
                  {isCorrect ? (
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
