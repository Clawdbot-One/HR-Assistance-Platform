import { Users, UserPlus, Calendar, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { label: '员工总数', value: '156', icon: Users, color: 'bg-blue-500' },
    { label: '本月入职', value: '8', icon: UserPlus, color: 'bg-green-500' },
    { label: '待审批', value: '12', icon: Calendar, color: 'bg-orange-500' },
    { label: '晋升中', value: '3', icon: TrendingUp, color: 'bg-purple-500' }
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">仪表盘</h1>
        <p className="text-slate-500 mt-1">人事管理系统概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">待办事项</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-700">审批请假申请 - 张三</span>
              <span className="text-xs text-slate-500">2小时前</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-700">面试安排 - 前端工程师</span>
              <span className="text-xs text-slate-500">3小时前</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-700">绩效考核 - 技术部</span>
              <span className="text-xs text-slate-500">5小时前</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">快捷入口</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
              <p className="font-medium text-blue-900">员工管理</p>
              <p className="text-sm text-blue-600 mt-1">查看和管理员工信息</p>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
              <p className="font-medium text-green-900">招聘管理</p>
              <p className="text-sm text-green-600 mt-1">发布职位和筛选简历</p>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left">
              <p className="font-medium text-orange-900">审批中心</p>
              <p className="text-sm text-orange-600 mt-1">处理待审批事项</p>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
              <p className="font-medium text-purple-900">绩效考核</p>
              <p className="text-sm text-purple-600 mt-1">设置和查看考核结果</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
