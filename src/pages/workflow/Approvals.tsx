import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react'

interface ApprovalTask {
  id: string
  title: string
  businessType: string
  applicantName: string
  deptName: string
  status: string
  createdAt: string
}

export default function Approvals() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'initiated'>('pending')

  const [tasks] = useState<ApprovalTask[]>([
    {
      id: 'task-001',
      title: '请假申请 - 张三',
      businessType: '请假',
      applicantName: '张三',
      deptName: '人事部',
      status: 'pending',
      createdAt: '2024-01-15 10:00'
    },
    {
      id: 'task-002',
      title: '招聘需求 - 前端工程师',
      businessType: '招聘',
      applicantName: '李四',
      deptName: '技术部',
      status: 'pending',
      createdAt: '2024-01-14 15:30'
    }
  ])

  const [completedTasks] = useState<ApprovalTask[]>([
    {
      id: 'task-003',
      title: '加班申请 - 王五',
      businessType: '加班',
      applicantName: '王五',
      deptName: '市场部',
      status: 'approved',
      createdAt: '2024-01-10 09:00'
    }
  ])

  const getStatusIcon = (status: string) => {
    if (status === 'pending') {
      return <Clock className="w-5 h-5 text-orange-500" />
    } else if (status === 'approved') {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">审批中心</h1>
        <p className="text-slate-500 mt-1">处理待审批事项和查看审批记录</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              待审批 ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              已审批 ({completedTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('initiated')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'initiated'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              我发起的
            </button>
          </nav>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">审批事项</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">业务类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">申请人</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">部门</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">提交时间</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {(activeTab === 'pending' ? tasks : completedTasks).map((task) => (
                <tr key={task.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusIcon(task.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{task.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{task.businessType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{task.applicantName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{task.deptName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(task.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {task.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 flex items-center justify-end space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>查看</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-200">
          <div className="text-sm text-slate-500">
            共 {(activeTab === 'pending' ? tasks : completedTasks).length} 条记录
          </div>
        </div>
      </div>
    </div>
  )
}
