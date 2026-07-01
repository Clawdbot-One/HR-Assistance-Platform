import { Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface PerformanceScheme {
  id: string
  name: string
  period: string
  type: string
  indicators: string
  status: string
}

export default function Schemes() {
  const [schemes] = useState<PerformanceScheme[]>([
    {
      id: 'perf-001',
      name: '2024年度绩效考核方案',
      period: '年度',
      type: 'KPI',
      indicators: '工作业绩、工作能力、工作态度',
      status: 'active'
    }
  ])

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-slate-100 text-slate-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    }
    const labels = {
      draft: '草稿',
      active: '进行中',
      completed: '已完成'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">绩效考核方案</h1>
          <p className="text-slate-500 mt-1">配置和管理绩效考核方案</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="w-5 h-5" />
          <span>创建方案</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {schemes.map((scheme) => (
          <div key={scheme.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{scheme.name}</h3>
                <p className="text-sm text-slate-500 mt-1">考核周期：{scheme.period}</p>
              </div>
              {getStatusBadge(scheme.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-500">考核方式</p>
                <p className="text-sm text-slate-800">{scheme.type}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">考核指标</p>
                <p className="text-sm text-slate-800">{scheme.indicators}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-slate-200">
              <button className="text-blue-600 hover:text-blue-900 text-sm flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>查看详情</span>
              </button>
              <button className="text-green-600 hover:text-green-900 text-sm flex items-center space-x-1">
                <Edit className="w-4 h-4" />
                <span>编辑</span>
              </button>
              <button className="text-red-600 hover:text-red-900 text-sm flex items-center space-x-1">
                <Trash2 className="w-4 h-4" />
                <span>删除</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
