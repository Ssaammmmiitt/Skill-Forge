import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export const AppLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <TopBar />
        <div className="p-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
