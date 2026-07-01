import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Building2,
  UserPlus,
  TrendingUp,
  Award,
  Target,
  Calendar,
  UserX,
  LogOut,
  CheckSquare
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/personnel/employees', icon: Users, label: '员工管理' },
  { path: '/personnel/organization', icon: Building2, label: '组织架构' },
  { path: '/recruitment/demands', icon: UserPlus, label: '招聘管理' },
  { path: '/promotion/plans', icon: TrendingUp, label: '职位晋升' },
  { path: '/cadre/plans', icon: Award, label: '干部评审' },
  { path: '/performance/schemes', icon: Target, label: '绩效考核' },
  { path: '/attendance/records', icon: Calendar, label: '出勤管理' },
  { path: '/resignation/applications', icon: UserX, label: '离职管理' },
  { path: '/workflow/approvals', icon: CheckSquare, label: '审批中心' }
]

export default function Sidebar() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">人事管理平台</h1>
        <p className="text-sm text-slate-400 mt-1">HR Management System</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white border-r-4 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          退出登录
        </button>
      </div>
    </aside>
  )
}
