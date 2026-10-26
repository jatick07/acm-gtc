// Relative base works both in production (same-origin Flask) and in dev
// (Vite proxies /api to Flask).
const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data
}

export const api = {
  health: () => request('/health'),

  stats: () => request('/stats'),

  getQuestions: () => request('/questions'),

  createQuestion: (snippet, answers, correctIndex, difficulty = 'low') =>
    request('/questions', {
      method: 'POST',
      body: JSON.stringify({
        snippet,
        answers,
        correct_index: correctIndex,
        difficulty,
      }),
    }),

  updateQuestion: (id, snippet, answers, correctIndex, difficulty = 'low') =>
    request(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        snippet,
        answers,
        correct_index: correctIndex,
        difficulty,
      }),
    }),

  deleteQuestion: (id) => request(`/questions/${id}`, { method: 'DELETE' }),

  checkAnswer: (questionId, answerIndex) =>
    request('/answers', {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, answer_index: answerIndex }),
    }),

  submitScore: (name, score, correctCount, totalCount) =>
    request('/scores', {
      method: 'POST',
      body: JSON.stringify({
        player_name: name,
        score: score,
        correct_count: correctCount,
        total_count: totalCount,
      }),
    }),

  getLeaderboard: (limit = 50) => request(`/leaderboard?limit=${limit}`),

  clearLeaderboard: () => request('/leaderboard', { method: 'DELETE' }),
}
