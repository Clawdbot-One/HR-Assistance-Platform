import { Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface CadrePlan {
  id: string
  title: string
  reviewPeriod: string
  scope: string
  dimensions: string
  startDate: string
  endDate: string
  status: string
}

export default function Plans() {
  const [plans] = useState<CadrePlan[]>([
    {
      id: 'cadre-001',
      title: '2024年度干部评审',
      reviewPeriod: '年度评审',
      scope: '全体管理干部',
      dimensions: '德、能、勤、绩、廉',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      status: 'draft'
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
          <h1 className="text-2xl font-bold text-slate-800">干部评审管理</h1>
          <p className="text-slate-500 mt-1">制定和管理干部评审方案</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="w-5 h-5" />
          <span>创建方案</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{plan.title}</h3>
                <p className="text-sm text-slate-500 mt-1">评审周期：{plan.reviewPeriod}</p>
              </div>
              {getStatusBadge(plan.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-500">评审范围</p>
                <p className="text-sm text-slate-800">{plan.scope}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">评审维度</p>
                <p className="text-sm text-slate-800">{plan.dimensions}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-500">评审时间</p>
              <p className="text-sm text-slate-800">{plan.startDate} ~ {plan.endDate}</p>
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
