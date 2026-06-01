import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useAuthStore } from '../../store/useAuthStore'
import { useStudentStore } from '../../store/useStudentStore'

const AppLayout = () => {
  const user = useAuthStore((state) => state.user)
  const refreshStudent = useStudentStore((state) => state.refreshStudent)

  useEffect(() => {
    if (user?.student_id) {
      refreshStudent(user.student_id).catch(() => {})
    }
  }, [user?.student_id, refreshStudent])

  return (
    <div className="flex h-screen overflow-hidden bg-raw-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto bg-space-deep p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
