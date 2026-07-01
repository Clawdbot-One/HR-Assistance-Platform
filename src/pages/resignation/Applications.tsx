import { Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface ResignationApplication {
  id: string
  employeeName: string
  deptName: string
  resignDate: string
  resignType: string
  reason: string
  status: string
}

export default function Applications() {
  const [applications] = useState<ResignationApplication[]>([
    {
      id: 'res-001',
      employeeName: '张三',
      deptName: '人事部',
      resignDate: '2024-02-15',
      resignType: '主动离职',
      reason: '个人发展原因',
      status: 'pending'
    }
  ])

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    }
    const labels = {
      pending: '待审批',
      approved: '已通过',
      rejected: '已驳回',
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
          <h1 className="text-2xl font-bold text-slate-800">离职管理</h1>
          <p className="text-slate-500 mt-1">管理员工离职申请和流程</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="w-5 h-5" />
          <span>提交申请</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">员工姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">部门</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">离职日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">离职类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">离职原因</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{app.employeeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{app.deptName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{app.resignDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{app.resignType}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500 max-w-xs truncate">{app.reason}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(app.status)}
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
            共 {applications.length} 条记录
          </div>
        </div>
      </div>
    </div>
  )
}
