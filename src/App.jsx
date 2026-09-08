import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import QuestionBanks from './pages/QuestionBanks.jsx'
import Teams from './pages/Teams.jsx'
import Challenges from './pages/Challenges.jsx'
import Settings from './pages/Settings.jsx'
import QuestionRound from './pages/QuestionRound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<QuestionBanks />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/challenges/round" element={<QuestionRound />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<QuestionBanks />} />
      </Route>
    </Routes>
  )
}