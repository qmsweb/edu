import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  loadTeams,
  addTeamPoints,
  loadQuestionBanks,
  loadTimerDuration,
  saveChallenge,
} from '../utils/storage.js'
import LandscapeGuard from '../components/LandscapeGuard.jsx'

const confettiColors = ['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#a855f7']

function getIsLandscape() {
  if (typeof window === 'undefined') return true
  if (window.screen?.orientation?.type) {
    return window.screen.orientation.type.includes('landscape')
  }
  return window.innerWidth > window.innerHeight
}

export default function QuestionRound() {
  const location = useLocation()
  const { teamAId, teamBId, bankId, timerDuration: passedDuration } = location.state || {}
  const [isLandscape, setIsLandscape] = useState(getIsLandscape)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [teams, setTeams] = useState(loadTeams)
  const [scoreFlash, setScoreFlash] = useState(null)
  const [duration] = useState(() => passedDuration || loadTimerDuration() || 60)
  const [timer, setTimer] = useState(duration)
  const [answeredTeam, setAnsweredTeam] = useState(null)
  const [wrongPick, setWrongPick] = useState(null)
  const [resultSaved, setResultSaved] = useState(false)

  const banks = loadQuestionBanks()
  const teamA = teams.find((t) => t.id === teamAId)
  const teamB = teams.find((t) => t.id === teamBId)
  const bank = banks.find((b) => b.id === bankId)
  const questions = (bank && bank.questions) || []

  const total = questions.length
  const current = questions[questionIndex]
  const finished = !current
  const isMc = !!current && current.type === 'mc' && Array.isArray(current.options)
  const timeUp = !finished && timer <= 0
  const answered = !finished && (timeUp || !!answeredTeam)

  const winner = finished && teamA && teamB
    ? teamA.points === teamB.points
      ? null
      : teamA.points > teamB.points
        ? teamA
        : teamB
    : null

  useEffect(() => {
    function check() {
      const isMobile = window.innerWidth < 768
      if (isMobile) setIsLandscape(getIsLandscape())
    }
    window.addEventListener('orientationchange', check)
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('orientationchange', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  useEffect(() => {
    if (finished) return
    setTimer(duration)
    setAnsweredTeam(null)
    setWrongPick(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionIndex, finished])

  useEffect(() => {
    if (finished || answered) return
    const id = window.setTimeout(() => setTimer((t) => t - 1), 1000)
    return () => window.clearTimeout(id)
  }, [timer, finished, answered])

  useEffect(() => {
    if (!finished || resultSaved || !teamA || !teamB || !bank) return
    setResultSaved(true)
    saveChallenge({
      teamAName: teamA.name,
      teamAPoints: teamA.points,
      teamBName: teamB.name,
      teamBPoints: teamB.points,
      winner: winner ? winner.name : null,
      bankTitle: bank.title,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, resultSaved, teamA, teamB, bank, winner])

  function creditTeam(teamId) {
    addTeamPoints(teamId, 1)
    setTeams(loadTeams())
    setScoreFlash({ teamId, nonce: Date.now() })
    window.setTimeout(
      () => setScoreFlash((f) => (f && f.teamId === teamId ? null : f)),
      1200
    )
    handleAdvance()
  }

  function handleMcPick(index) {
    if (finished || answered || !isMc) return
    if (index === current.correctIndex) {
      setAnsweredTeam('pick') // فتح شاشة اختيار الفريق
    } else {
      setWrongPick(index)
      window.setTimeout(() => setWrongPick(null), 900)
    }
  }

  function handleAdvance() {
    setQuestionIndex((i) => i + 1)
  }

  if (!teamA || !teamB || !bank) {
    return (
      <div className="space-y-6 max-w-2xl">
        <MissingHeader />
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-14 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.024-.833-2.794 0L5.354 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-slate-600 font-semibold">لم يتم تجهيز المواجهة</p>
          <p className="text-sm text-slate-400 mt-1 mb-5">
            اختر الفريقين وبنك الأسئلة من شاشة إعداد التحدي أولاً
          </p>
          <Link
            to="/challenges"
            className="inline-flex px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            العودة لإعداد التحدي
          </Link>
        </div>
      </div>
    )
  }

  if (!isLandscape) {
    return (
      <LandscapeGuard
        onConfirm={() => setIsLandscape(true)}
        onCancel={() => window.history.back()}
      />
    )
  }

  if (finished) {
    return (
      <div className="space-y-6">
        <RoundHeader finished bank={bank} questionIndex={questionIndex} total={total} />
        <ResultCard teamA={teamA} teamB={teamB} winner={winner} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <RoundHeader bank={bank} questionIndex={questionIndex} total={total} />

      {/* المؤقت */}
      <TimerBar seconds={timer} duration={duration} />

      {/* فريقا المواجهة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <TeamPanel
          team={teamA}
          gradient="from-brand-600 to-brand-500"
          ring="ring-brand-300"
          accent="text-brand-700 bg-brand-50 border-brand-200 hover:bg-brand-100"
          flash={scoreFlash}
          showJudge={!isMc && !finished && !answered}
          onCorrect={() => creditTeam(teamA.id)}
        />
        <TeamPanel
          team={teamB}
          gradient="from-rose-600 to-rose-500"
          ring="ring-rose-300"
          accent="text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100"
          flash={scoreFlash}
          showJudge={!isMc && !finished && !answered}
          onCorrect={() => creditTeam(teamB.id)}
        />
      </div>

      <div key={current.id} className="animate-question-in bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xs font-bold text-brand-600 bg-brand-50 rounded-full px-3 py-1">
            السؤال {questionIndex + 1} من {total}
          </span>
          <span className="text-xs text-slate-400">
            {bank.subject && `${bank.subject} · `}
            {bank.title}
          </span>
          {isMc && (
            <span className="text-xs font-bold text-sky-600 bg-sky-50 rounded-full px-3 py-1">
              اختيار من متعدد
            </span>
          )}
        </div>
        <p className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed max-w-2xl mx-auto">
          {current.text}
        </p>

        {isMc && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {current.options.map((option, i) => {
              let cls = 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 text-slate-700'
              let extra = null
              if (answered) {
                if (i === current.correctIndex) {
                  cls = 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  extra = (
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )
                } else if (i === wrongPick) {
                  cls = 'border-rose-400 bg-rose-50 text-rose-700'
                  extra = (
                    <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )
                } else {
                  cls = 'border-slate-200 bg-slate-50 text-slate-400'
                }
              } else if (wrongPick === i) {
                cls = 'border-rose-400 bg-rose-50 text-rose-700 animate-shake'
                extra = (
                  <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )
              }
              return (
                <button
                  key={i}
                  onClick={() => handleMcPick(i)}
                  disabled={answered}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-start text-sm font-semibold transition-all active:scale-[0.98] ${cls} ${
                    answered ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <span className="w-8 h-8 shrink-0 rounded-full bg-white border border-current flex items-center justify-center text-xs font-black">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 leading-relaxed">{option}</span>
                  {extra}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* نتيجة السؤال للاختيار من متعدد */}
      {isMc && answeredTeam === 'pick' && (
        <div className="animate-question-in bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-center">
          <p className="font-bold text-emerald-800 mb-4">إجابة صحيحة! أي فريق سجل النقطة؟</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => creditTeam(teamA.id)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-l from-brand-600 to-brand-500 text-white text-sm font-bold hover:from-brand-700 hover:to-brand-600 transition-all shadow shadow-brand-600/25 active:scale-95"
            >
              {teamA.name}
            </button>
            <button
              onClick={() => creditTeam(teamB.id)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-l from-rose-600 to-rose-500 text-white text-sm font-bold hover:from-rose-700 hover:to-rose-600 transition-all shadow shadow-rose-600/25 active:scale-95"
            >
              {teamB.name}
            </button>
          </div>
        </div>
      )}

      {/* انتهى الوقت */}
      {timeUp && answeredTeam !== 'pick' && (
        <div className="animate-question-in bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 text-center">
          <p className="font-bold text-amber-800 mb-3">انتهى الوقت</p>
          <button
            onClick={handleAdvance}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition-colors"
          >
            السؤال التالي
          </button>
        </div>
      )}

      {/* زر تخطي للأسئلة النصية والاختيارية عند الحاجة */}
      {!isMc && !answered && (
        <p className="text-center text-sm text-slate-400">
          عند إجابة الفريق إجابةً صحيحة، اضغط زر المنافس المقابل لإضافة نقطة والانتقال للسؤال التالي
        </p>
      )}
    </div>
  )
}

function TimerBar({ seconds, duration }) {
  const pct = Math.max(0, (seconds / Math.max(duration, 1)) * 100)
  const low = seconds <= 10
  const mid = seconds <= 30
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  const strokeColor = low
    ? '#f43f5e'
    : mid
      ? '#f59e0b'
      : '#6366f1'

  const bgColor = low ? '#fff1f2' : mid ? '#fffbeb' : '#eef2ff'

  return (
    <div className="fixed left-6 bottom-6 z-50" dir="ltr">
      <div
        className={`relative w-28 h-28 rounded-full bg-white shadow-2xl border-2 flex items-center justify-center ${
          low ? 'animate-pulse border-rose-300' : mid ? 'border-amber-300' : 'border-indigo-300'
        } ${low && seconds <= 5 ? 'animate-timer-critical' : ''}`}
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke={bgColor}
            strokeWidth="5"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        <div className="flex flex-col items-center justify-center">
          <span
            className={`text-3xl font-black tabular-nums leading-none ${
              low ? 'text-rose-600' : mid ? 'text-amber-600' : 'text-indigo-600'
            }`}
          >
            {seconds}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 mt-1">ثانية</span>
        </div>
      </div>
    </div>
  )
}

function TeamPanel({ team, gradient, ring, accent, flash, showJudge, onCorrect }) {
  const isFlash = flash && flash.teamId === team.id
  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 p-6 text-center overflow-visible">
      {isFlash && (
        <div key={flash.nonce} className="pointer-events-none">
          <span className="animate-float-up absolute top-8 right-1/2 translate-x-1/2 text-3xl font-black text-amber-500">
            +1
          </span>
        </div>
      )}

      <div className="flex items-center justify-center mb-3">
        <div
          key={`avatar-${flash?.nonce}`}
          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-3xl font-bold shadow-lg ${
            isFlash ? 'animate-ring-pulse ring-4 ' + ring : ''
          }`}
        >
          {(team.name || '؟').trim().charAt(0)}
        </div>
      </div>

      <p className="font-bold text-slate-800 truncate">{team.name}</p>
      <p
        key={`score-${flash?.nonce}`}
        className={`text-4xl font-black text-slate-800 tabular-nums mt-2 ${isFlash ? 'animate-score-pop' : ''}`}
      >
        {team.points}
      </p>
      <p className="text-xs text-slate-400 mt-0.5">نقطة</p>

      {showJudge && (
        <button
          onClick={onCorrect}
          className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-colors ${accent} active:scale-95`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          إجابة صحيحة
        </button>
      )}
    </div>
  )
}

function RoundHeader({ bank, questionIndex, total, finished }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Link
          to="/challenges"
          className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 transition-colors"
          aria-label="العودة للتحدي"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">المواجهة</h2>
          <p className="text-sm text-slate-500 mt-1">
            {finished ? 'انتهت الأسئلة — اعرض النتيجة النهائية' : `${bank.title} · السؤال ${questionIndex + 1} من ${total}`}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-3 flex items-center gap-3">
        <span className="text-xs text-slate-400">بنك الأسئلة</span>
        <span className="text-sm font-semibold text-slate-700">{bank.title}</span>
      </div>
    </div>
  )
}

function MissingHeader() {
  return (
    <div className="flex items-center gap-4">
      <Link
        to="/challenges"
        className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 transition-colors"
        aria-label="العودة للتحدي"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
      <div>
        <h2 className="text-2xl font-bold text-slate-800">المواجهة</h2>
      </div>
    </div>
  )
}

function ResultCard({ teamA, teamB, winner }) {
  return (
    <div className="animate-question-in bg-white rounded-2xl border border-slate-200 p-10 text-center relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-3" aria-hidden="true">
        {confettiColors.map((c, i) => (
          <span
            key={i}
            className="w-3 h-3"
            style={{
              background: c,
              borderRadius: i % 2 ? '50%' : '2px',
              animation: `confetti-fall 1.4s ease-in ${i * 0.15}s forwards`,
            }}
          />
        ))}
      </div>

      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.975 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </div>

      <p className="text-slate-600 font-semibold">انتهت المواجهة</p>
      <p className="text-xl font-black text-slate-800 mt-2">
        {winner
          ? `فاز: ${winner.name}`
          : teamA.points === teamB.points
            ? 'تعادل مثير بين الفريقين!'
            : ''}
      </p>
      <p className="text-sm text-slate-400 mt-1 mb-6">
        {teamA.name} {teamA.points} · {teamB.name} {teamB.points}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/challenges"
          className="inline-flex px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          العودة للتحدي
        </Link>
        <Link
          to="/challenges"
          className="inline-flex px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors shadow shadow-brand-600/25"
        >
          مواجهة جديدة
        </Link>
      </div>
    </div>
  )
}