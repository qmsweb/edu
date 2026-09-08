const BANKS_KEY = 'edu-challenge.questionBanks'
const TEAMS_KEY = 'edu-challenge.teams'

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (err) {
    console.error(`تعذر قراءة البيانات من localStorage (${key})`, err)
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`تعذر حفظ البيانات في localStorage (${key})`, err)
  }
}

function uid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function nowISO() {
  return new Date().toISOString()
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

/* ================= بنوك الأسئلة ================= */

export function loadQuestionBanks() {
  return readJSON(BANKS_KEY, [])
}

export function persistQuestionBanks(banks) {
  writeJSON(BANKS_KEY, banks)
}

export function createQuestionBank({ title, subject = '' }) {
  const banks = loadQuestionBanks()
  const bank = {
    id: uid(),
    title,
    subject,
    color: ['indigo', 'emerald', 'rose'][banks.length % 3],
    questions: [],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
  banks.push(bank)
  persistQuestionBanks(banks)
  return bank
}

export function updateQuestionBank(bankId, patch) {
  const banks = loadQuestionBanks()
  const bank = banks.find((b) => b.id === bankId)
  if (!bank) return null
  Object.assign(bank, patch, { updatedAt: nowISO() })
  persistQuestionBanks(banks)
  return bank
}

export function deleteQuestionBank(bankId) {
  persistQuestionBanks(loadQuestionBanks().filter((b) => b.id !== bankId))
}

export function addQuestion(bankId, text) {
  const banks = loadQuestionBanks()
  const bank = banks.find((b) => b.id === bankId)
  if (!bank) return null
  bank.questions = bank.questions || []
  bank.questions.push({ id: uid(), text, createdAt: nowISO() })
  bank.updatedAt = nowISO()
  persistQuestionBanks(banks)
  return bank
}

export function editQuestion(bankId, questionId, text) {
  const banks = loadQuestionBanks()
  const bank = banks.find((b) => b.id === bankId)
  if (!bank) return null
  const question = (bank.questions || []).find((q) => q.id === questionId)
  if (!question) return null
  question.text = text
  bank.updatedAt = nowISO()
  persistQuestionBanks(banks)
  return bank
}

export function deleteQuestion(bankId, questionId) {
  const banks = loadQuestionBanks()
  const bank = banks.find((b) => b.id === bankId)
  if (!bank) return null
  bank.questions = (bank.questions || []).filter((q) => q.id !== questionId)
  bank.updatedAt = nowISO()
  persistQuestionBanks(banks)
  return bank
}

/* ================= الفرق ================= */

export function loadTeams() {
  return readJSON(TEAMS_KEY, [])
}

export function persistTeams(teams) {
  writeJSON(TEAMS_KEY, teams)
}

export function createTeam(name) {
  const teams = loadTeams()
  const team = { id: uid(), name, points: 0, createdAt: nowISO() }
  teams.push(team)
  persistTeams(teams)
  return team
}

export function updateTeam(teamId, patch) {
  const teams = loadTeams()
  const team = teams.find((t) => t.id === teamId)
  if (!team) return null
  Object.assign(team, patch)
  persistTeams(teams)
  return team
}

export function deleteTeam(teamId) {
  persistTeams(loadTeams().filter((t) => t.id !== teamId))
}

export function addTeamPoints(teamId, delta) {
  const teams = loadTeams()
  const team = teams.find((t) => t.id === teamId)
  if (!team) return null
  team.points = Math.max(0, (team.points || 0) + delta)
  persistTeams(teams)
  return team
}

export { formatDate }