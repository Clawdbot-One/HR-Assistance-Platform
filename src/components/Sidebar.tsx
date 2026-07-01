import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
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
  CheckSquare,
  ChevronDown,
  ChevronRight,
  FileText,
  ClipboardCheck,
  MessageSquare,
  UsersRound,
  Megaphone
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

const promotionSubItems = [
  { path: '/promotion/plans', icon: TrendingUp, label: '晋升计划' },
  { path: '/promotion/applications', icon: FileText, label: '晋升申请' },
  { path: '/promotion/qualification-review', icon: ClipboardCheck, label: '资格审查' },
  { path: '/promotion/democratic-review', icon: MessageSquare, label: '民主评议' },
  { path: '/promotion/committee-review', icon: UsersRound, label: '委员会评审' },
  { path: '/promotion/publicity', icon: Megaphone, label: '公示管理' }
]

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/personnel/employees', icon: Users, label: '员工管理' },
  { path: '/personnel/organization', icon: Building2, label: '组织架构' },
  { path: '/recruitment/demands', icon: UserPlus, label: '招聘管理' },
  { path: '/cadre/plans', icon: Award, label: '干部评审' },
  { path: '/performance/schemes', icon: Target, label: '绩效考核' },
  { path: '/attendance/records', icon: Calendar, label: '出勤管理' },
  { path: '/resignation/applications', icon: UserX, label: '离职管理' },
  { path: '/workflow/approvals', icon: CheckSquare, label: '审批中心' }
]

export default function Sidebar() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [promotionExpanded, setPromotionExpanded] = useState(
    location.pathname.startsWith('/promotion')
  )

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

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
            className={({ isActive: linkActive }) =>
              `flex items-center px-6 py-3 text-sm transition-colors ${
                linkActive
                  ? 'bg-blue-600 text-white border-r-4 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}

        {/* 职位晋升 - 带子菜单 */}
        <div>
          <button
            onClick={() => setPromotionExpanded(!promotionExpanded)}
            className={`flex items-center w-full px-6 py-3 text-sm transition-colors ${
              location.pathname.startsWith('/promotion')
                ? 'text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <TrendingUp className="w-5 h-5 mr-3" />
            <span className="flex-1 text-left">职位晋升</span>
            {promotionExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {promotionExpanded && (
            <div className="bg-slate-800/50">
              {promotionSubItems.map((sub) => (
                <NavLink
                  key={sub.path}
                  to={sub.path}
                  className={`flex items-center px-6 py-2.5 pl-12 text-xs transition-colors ${
                    isActive(sub.path)
                      ? 'bg-blue-600/30 text-blue-300 border-r-2 border-blue-400'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <sub.icon className="w-4 h-4 mr-2" />
                  {sub.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
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
