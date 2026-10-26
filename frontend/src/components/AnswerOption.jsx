// A single multiple-choice answer. `state` is 'idle' | 'correct' | 'wrong'.
export default function AnswerOption({ label, text, state, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`y2k-answer w-full ${
        state === 'correct'
          ? 'correct'
          : state === 'wrong'
            ? 'wrong'
            : ''
      }`}
    >
      <span className="key">{label}</span>
      <span className="flex-1 break-all">{text}</span>
    </button>
  )
}
