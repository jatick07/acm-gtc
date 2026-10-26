import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Pencil, ArrowLeft, AlertCircle, Check, Circle } from 'lucide-react'
import { Sparkle } from '../components/Decorations'
import Y2kWindow from '../components/Y2kWindow'
import { api } from '../api'

const EMPTY_ANSWER = ['', '']

export default function CreatorPage({ onBack, onQuestionsChanged }) {
  const [list, setList] = useState([])
  const [snippet, setSnippet] = useState('')
  const [answers, setAnswers] = useState(EMPTY_ANSWER.map((v) => v))
  const [correctIndex, setCorrectIndex] = useState(0)
  const [difficulty, setDifficulty] = useState('low')
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [ok, setOk] = useState(null)
  useEffect(() => {
    loadList()
  }, [])

  async function loadList() {
    try {
      setList(await api.getQuestions())
    } catch (e) {
      setError(e.message)
    }
  }

  function resetForm() {
    setSnippet('')
    setAnswers(EMPTY_ANSWER.map((v) => v))
    setDifficulty('low')
    setError(null)
    setOk(null)
  }

  function addAnswer() {
    setAnswers((a) => [...a, ''])
  }

  function removeAnswer(idx) {
    setAnswers((a) => a.filter((_, i) => i !== idx))
    setCorrectIndex((c) => Math.min(c, answers.length - 1))
  }

  async function save(e) {
    e.preventDefault()
    const cleaned = answers.map((s) => s.trim()).filter((s) => s.length > 0)
    if (!snippet.trim()) {
      setError('Code snippet is required.')
      return
    }
    if (cleaned.length < 2) {
      setError('Add at least 2 answer options.')
      return
    }
    if (correctIndex >= cleaned.length) {
      setError('Pick a correct answer.')
      return
    }
    setBusy(true)
    setError(null)
    setOk(null)
    try {
      if (editingId != null) {
        await api.updateQuestion(editingId, snippet, cleaned, correctIndex, difficulty)
        setOk('Question updated!')
      } else {
        await api.createQuestion(snippet, cleaned, correctIndex, difficulty)
        setOk('Question added!')
      }
      resetForm()
      await loadList()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function edit(q) {
    setSnippet(q.snippet)
    setAnswers(q.answers.map((a) => a.text))
    setCorrectIndex(q.answers.findIndex((a) => a.is_correct))
    setDifficulty(q.difficulty || 'low')
    setError(null)
    setOk(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function remove(id) {
    try {
      await api.deleteQuestion(id)
      await loadList()
      if (editingId === id) resetForm()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <button className="y2k-btn btn-ghost text-[8px]" onClick={onBack}>
        <ArrowLeft size={14} className="inline" /> MENU
      </button>

      <Y2kWindow
        title={editingId ? 'EDIT QUESTION' : 'QUESTION EDITOR'}
        titleIcon={<Sparkle size={12} className="text-[var(--sparkle)]" />}
      >
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="y2k-label">CODE SNIPPET</label>
            <textarea
              className="y2k-input mt-1 resize-y"
              rows="4"
              value={snippet}
              onChange={(e) => setSnippet(e.target.value)}
              placeholder="print(2 + 3 * 2)"
            />
          </div>
          <div>
            <label className="y2k-label">DIFFICULTY</label>
            <select
              className="y2k-input mt-1"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="low">LOW</option>
              <option value="medium">MEDIUM</option>
              <option value="high">HIGH</option>
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="y2k-label">ANSWER OPTIONS</label>
              <button
                type="button"
                className="y2k-btn btn-ghost py-1 px-2 text-[8px]"
                onClick={addAnswer}
              >
                <Plus size={12} className="inline" /> ADD
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {answers.map((a, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`y2k-btn py-1 px-2 text-[8px] ${
                      correctIndex === idx ? '' : 'btn-ghost'
                    }`}
                    onClick={() => setCorrectIndex(idx)}
                    title="Mark as correct"
                  >
                    {correctIndex === idx ? (
                      <Check size={16} className="inline" />
                    ) : (
                      <Circle size={16} className="inline" />
                    )}
                  </button>
                  <input
                    className="y2k-input"
                    value={a}
                    onChange={(e) => {
                      const n = answers.slice()
                      n[idx] = e.target.value
                      setAnswers(n)
                    }}
                    placeholder={`Output option ${idx + 1}`}
                  />
                  <button
                    type="button"
                    className="y2k-btn btn-danger py-1 px-2 text-[8px]"
                    onClick={() => removeAnswer(idx)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2 font-semibold">
              The check button marks the correct output.
            </p>
          </div>

          {error && (
            <p className="text-[var(--wrong)] font-semibold text-sm flex items-center gap-1">
              <AlertCircle size={14} /> {error}
            </p>
          )}
          {ok && (
            <p className="text-[var(--correct)] font-semibold text-sm flex items-center gap-1">
              <Sparkle size={12} className="text-[var(--correct)]" /> {ok}
            </p>
          )}

          <div className="flex gap-2">
            <button type="submit" className="y2k-btn" disabled={busy}>
              <Save size={14} className="inline" /> {editingId ? 'UPDATE' : 'SAVE'}
            </button>
            {editingId && (
              <button type="button" className="y2k-btn btn-ghost" onClick={resetForm}>
                CANCEL
              </button>
            )}
          </div>
        </form>
      </Y2kWindow>

      <Y2kWindow title={`QUESTIONS (${list.length})`} titleIcon={<Pencil size={12} />}>
        {list.length === 0 ? (
          <p className="font-pixel-lg text-lg text-[var(--text-muted)]">
            No questions yet. Add one above!
          </p>
        ) : (
          <div className="space-y-3">
            {list.map((q) => (
              <div key={q.id} className="border-2 border-[var(--border)] p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-[8px] text-[var(--text-muted)]">
                    #{q.id}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="y2k-btn btn-ghost py-1 px-2 text-[8px]"
                      onClick={() => edit(q)}
                    >
                      <Pencil size={12} className="inline" /> EDIT
                    </button>
                    <button
                      className="y2k-btn btn-danger py-1 px-2 text-[8px]"
                      onClick={() => remove(q.id)}
                    >
                      <Trash2 size={12} className="inline" /> DEL
                    </button>
                  </div>
                </div>
                <pre className="y2k-code text-sm mb-2 whitespace-pre-wrap">{q.snippet}</pre>
                <ol className="space-y-1 text-sm">
                  {q.answers.map((a, idx) => (
                    <li
                      key={idx}
                      className={`font-semibold flex items-center gap-2 ${
                        idx === q.correct_answer
                          ? 'text-[var(--correct)]'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      <span className="text-[9px] font-pixel">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {a.text}
                      {idx === q.correct_answer && (
                        <span className="ml-auto text-[9px] font-pixel bg-[var(--correct)] text-white px-1">
                          CORRECT
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </Y2kWindow>
    </div>
  )
}
