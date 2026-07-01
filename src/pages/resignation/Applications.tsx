import { Plus, Eye, Edit, Trash2, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ResignationApplication {
  id: string
  employee_id?: string
  employee_name: string
  dept_name: string
  resign_date: string
  resign_type: string
  reason: string
  status: string
}

interface Employee {
  id: string
  name: string
  dept_name: string
}

export default function Applications() {
  const [applications, setApplications] = useState<ResignationApplication[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add')
  const [currentApp, setCurrentApp] = useState<ResignationApplication | null>(null)
  const [formData, setFormData] = useState({
    employee_id: '',
    resign_date: '',
    resign_type: '主动离职',
    reason: ''
  })

  useEffect(() => {
    fetchApplications()
    fetchEmployees()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/resignation/applications')
      const data = await response.json()
      if (data.success) {
        setApplications(data.data)
      }
    } catch (error) {
      console.error('获取离职申请失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      const data = await response.json()
      if (data.success) {
        setEmployees(data.data)
      }
    } catch (error) {
      console.error('获取员工列表失败:', error)
    }
  }

  const handleAdd = () => {
    setModalType('add')
    setFormData({
      employee_id: '',
      resign_date: '',
      resign_type: '主动离职',
      reason: ''
    })
    setShowModal(true)
  }

  const handleEdit = (app: ResignationApplication) => {
    setModalType('edit')
    setCurrentApp(app)
    setFormData({
      employee_id: app.employee_id || '',
      resign_date: app.resign_date,
      resign_type: app.resign_type,
      reason: app.reason
    })
    setShowModal(true)
  }

  const handleView = (app: ResignationApplication) => {
    setModalType('view')
    setCurrentApp(app)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该离职申请吗？')) return
    
    try {
      const response = await fetch(`/api/resignation/applications/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        fetchApplications()
      } else {
        alert(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除离职申请失败:', error)
      alert('删除失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = modalType === 'add' ? '/api/resignation/applications' : `/api/resignation/applications/${currentApp?.id}`
      const method = modalType === 'add' ? 'POST' : 'PUT'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      if (data.success) {
        setShowModal(false)
        fetchApplications()
      } else {
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      alert('操作失败')
    }
  }

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
        <button 
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
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
                    <div className="text-sm font-medium text-slate-900">{app.employee_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{app.dept_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{app.resign_date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{app.resign_type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500 max-w-xs truncate">{app.reason}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleView(app)}
                        className="text-blue-600 hover:text-blue-900"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(app)}
                        className="text-green-600 hover:text-green-900"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(app.id)}
                        className="text-red-600 hover:text-red-900"
                        title="删除"
                      >
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {modalType === 'add' ? '提交离职申请' : modalType === 'edit' ? '编辑离职申请' : '离职详情'}
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
                    <label className="text-sm font-medium text-slate-700">员工姓名</label>
                    <p className="mt-1 text-slate-900">{currentApp?.employee_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">部门</label>
                    <p className="mt-1 text-slate-900">{currentApp?.dept_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">离职日期</label>
                    <p className="mt-1 text-slate-900">{currentApp?.resign_date}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">离职类型</label>
                    <p className="mt-1 text-slate-900">{currentApp?.resign_type}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700">离职原因</label>
                    <p className="mt-1 text-slate-900 whitespace-pre-wrap">{currentApp?.reason}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">状态</label>
                    <div className="mt-1">
                      {currentApp && getStatusBadge(currentApp.status)}
                    </div>
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
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">员工 *</label>
                  <select
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                    disabled={modalType === 'edit'}
                  >
                    <option value="">请选择员工</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.dept_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">离职日期 *</label>
                  <input
                    type="date"
                    value={formData.resign_date}
                    onChange={(e) => setFormData({ ...formData, resign_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">离职类型 *</label>
                  <select
                    value={formData.resign_type}
                    onChange={(e) => setFormData({ ...formData, resign_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="主动离职">主动离职</option>
                    <option value="被动离职">被动离职</option>
                    <option value="合同到期">合同到期</option>
                    <option value="退休">退休</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">离职原因 *</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows={4}
                    placeholder="请详细说明离职原因..."
                    required
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
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {modalType === 'add' ? '提交' : '保存'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
