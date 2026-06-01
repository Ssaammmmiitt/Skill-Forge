import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Quiz from './pages/Quiz'
import Logger from './pages/Logger'
import LearningPath from './pages/LearningPath'
import Analytics from './pages/Analytics'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'
import ComponentTest from './pages/ComponentTest'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/log" element={<Logger />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="path" element={<LearningPath />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="admin" element={<Admin />} />
          <Route path="test" element={<ComponentTest />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
