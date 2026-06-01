import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Spinner from './components/ui/Spinner'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy load all pages
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Logger = lazy(() => import('./pages/Logger'))
const LearningPath = lazy(() => import('./pages/LearningPath'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Admin = lazy(() => import('./pages/Admin'))
const ComponentTest = lazy(() => import('./pages/ComponentTest'))

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="min-h-screen bg-arcade-surface flex items-center justify-center">
              <Spinner variant="arcade" size="lg" />
            </div>
          }
        >
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Quiz - full screen */}
            <Route path="/quiz" element={<Quiz />} />
            
            {/* Protected routes with sidebar */}
            <Route path="/dashboard" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
            </Route>
            <Route path="/app" element={<AppLayout />}>
              <Route path="profile" element={<Profile />} />
              <Route path="log" element={<Logger />} />
              <Route path="path" element={<LearningPath />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="admin" element={<Admin />} />
              <Route path="test" element={<ComponentTest />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
