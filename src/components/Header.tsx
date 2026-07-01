import { Bell, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Header() {
  const { user } = useAuthStore()

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-slate-800">
          欢迎回来，{user?.employeeName || '用户'}
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-800">{user?.employeeName}</p>
            <p className="text-slate-500 text-xs">{user?.deptName}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
