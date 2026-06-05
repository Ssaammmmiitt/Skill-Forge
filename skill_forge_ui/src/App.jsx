import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import ToastStack from './components/ui/ToastStack'
import Spinner from './components/ui/Spinner'
import ErrorBoundary from './components/ErrorBoundary'

const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Logger = lazy(() => import('./pages/Logger'))
const DailyTasks = lazy(() => import('./pages/DailyTasks'))
const LearningPath = lazy(() => import('./pages/LearningPath'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const CustomQuizSetup = lazy(() => import('./pages/CustomQuizSetup'))
const DocumentReader = lazy(() => import('./pages/DocumentReader'))
const ComponentTest = lazy(() => import('./pages/ComponentTest'))

const routerFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={routerFutureFlags}>
        <ToastStack />
        <Suspense
          fallback={
            <div className="min-h-screen bg-raw-bg flex items-center justify-center">
              <Spinner variant="arcade" size="lg" />
            </div>
          }
        >
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Authenticated - dashboard, app, quiz, legacy redirects */}
            <Route element={<ProtectedRoute />}>
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/quiz/custom" element={<Navigate to="/app/quiz/custom" replace />} />
              <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
              <Route path="/log" element={<Navigate to="/app/log" replace />} />
              <Route path="/tasks" element={<Navigate to="/app/tasks" replace />} />
              <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
              <Route path="/leaderboard" element={<Navigate to="/app/leaderboard" replace />} />
              <Route path="/path" element={<Navigate to="/app/path" replace />} />
              <Route path="/dashboard" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
              </Route>
              <Route path="/app" element={<AppLayout />}>
                <Route path="profile" element={<Profile />} />
                <Route path="log" element={<Logger />} />
                <Route path="tasks" element={<DailyTasks />} />
                <Route path="path" element={<LearningPath />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="reader" element={<DocumentReader />} />
                <Route path="quiz/custom" element={<CustomQuizSetup />} />
                <Route path="test" element={<ComponentTest />} />
              </Route>
            </Route>

            {/* Unknown paths → home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
