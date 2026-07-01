import { useState } from 'react'
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react'

interface Demand {
  id: string
  deptName: string
  positionName: string
  headcount: number
  requirements: string
  status: string
  createdAt: string
}

export default function Demands() {
  const [demands] = useState<Demand[]>([
    {
      id: 'dem-001',
      deptName: '技术部',
      positionName: '前端工程师',
      headcount: 3,
      requirements: '本科及以上学历，3年以上前端开发经验',
      status: 'pending',
      createdAt: '2024-01-15'
    },
    {
      id: 'dem-002',
      deptName: '市场部',
      positionName: '市场专员',
      headcount: 2,
      requirements: '大专及以上学历，市场营销相关专业',
      status: 'approved',
      createdAt: '2024-01-10'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')

  const filteredDemands = demands.filter(d =>
    d.positionName.includes(searchTerm) || d.deptName.includes(searchTerm)
  )

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    const labels = {
      pending: '待审批',
      approved: '已通过',
      rejected: '已驳回'
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
          <h1 className="text-2xl font-bold text-slate-800">招聘需求管理</h1>
          <p className="text-slate-500 mt-1">管理各部门的用人需求申请</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="w-5 h-5" />
          <span>提交需求</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索职位名称或部门..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">职位名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">需求部门</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">招聘人数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">任职要求</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">提交日期</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredDemands.map((demand) => (
                <tr key={demand.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{demand.positionName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{demand.deptName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{demand.headcount} 人</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500 max-w-xs truncate">{demand.requirements}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(demand.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {demand.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-200">
          <div className="text-sm text-slate-500">
            共 {filteredDemands.length} 条记录
          </div>
        </div>
      </div>
    </div>
  )
}
