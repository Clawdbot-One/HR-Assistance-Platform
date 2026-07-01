import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Eye, X } from 'lucide-react'

interface ApprovalTask {
  id: string
  title: string
  business_type: string
  applicant_name: string
  dept_name: string
  status: string
  created_at: string
}

export default function Approvals() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'initiated'>('pending')
  const [tasks, setTasks] = useState<ApprovalTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'view' | 'approve' | 'reject'>('view')
  const [currentTask, setCurrentTask] = useState<ApprovalTask | null>(null)
  const [comment, setComment] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/workflow/tasks')
      const data = await response.json()
      if (data.success) {
        setTasks(data.data)
      }
    } catch (error) {
      console.error('获取审批任务失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const pendingTasks = tasks.filter(task => task.status === 'pending')
  const completedTasks = tasks.filter(task => task.status === 'approved' || task.status === 'rejected')

  const handleView = (task: ApprovalTask) => {
    setModalType('view')
    setCurrentTask(task)
    setShowModal(true)
  }

  const handleApprove = (task: ApprovalTask) => {
    setModalType('approve')
    setCurrentTask(task)
    setComment('')
    setShowModal(true)
  }

  const handleReject = (task: ApprovalTask) => {
    setModalType('reject')
    setCurrentTask(task)
    setComment('')
    setShowModal(true)
  }

  const handleSubmitApproval = async () => {
    if (!currentTask) return

    try {
      const action = modalType === 'approve' ? 'approve' : 'reject'
      const response = await fetch(`/api/workflow/tasks/${currentTask.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
      })
      
      const data = await response.json()
      if (data.success) {
        setShowModal(false)
        fetchTasks()
      } else {
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('审批操作失败:', error)
      alert('操作失败')
    }
  }

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
              {(activeTab === 'pending' ? pendingTasks : completedTasks).map((task) => (
                <tr key={task.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusIcon(task.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{task.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{task.business_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{task.applicant_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{task.dept_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(task.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {task.created_at}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleView(task)}
                        className="text-blue-600 hover:text-blue-900"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {task.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(task)}
                            className="text-green-600 hover:text-green-900"
                            title="通过"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleReject(task)}
                            className="text-red-600 hover:text-red-900"
                            title="驳回"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
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

      {showModal && currentTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {modalType === 'view' ? '审批详情' : modalType === 'approve' ? '审批通过' : '审批驳回'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalType === 'view' ? (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">审批事项</label>
                    <p className="mt-1 text-slate-900">{currentTask.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">业务类型</label>
                    <p className="mt-1 text-slate-900">{currentTask.business_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">申请人</label>
                    <p className="mt-1 text-slate-900">{currentTask.applicant_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">部门</label>
                    <p className="mt-1 text-slate-900">{currentTask.dept_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">状态</label>
                    <div className="mt-1">
                      {getStatusBadge(currentTask.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">提交时间</label>
                    <p className="mt-1 text-slate-900">{currentTask.created_at}</p>
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    关闭
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">审批信息</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">审批事项：</span>
                      <span className="text-slate-900">{currentTask.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">申请人：</span>
                      <span className="text-slate-900">{currentTask.applicant_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">部门：</span>
                      <span className="text-slate-900">{currentTask.dept_name}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {modalType === 'approve' ? '审批意见（可选）' : '驳回原因 *'}
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows={4}
                    placeholder={modalType === 'approve' ? '请输入审批意见...' : '请输入驳回原因...'}
                    required={modalType === 'reject'}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmitApproval}
                    className={`px-4 py-2 text-white rounded-lg transition-colors ${
                      modalType === 'approve'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {modalType === 'approve' ? '确认通过' : '确认驳回'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
