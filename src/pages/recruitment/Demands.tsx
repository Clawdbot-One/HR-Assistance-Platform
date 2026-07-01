import { useState, useEffect } from 'react'
import { Plus, Search, Eye, Edit, Trash2, X } from 'lucide-react'

interface Demand {
  id: string
  dept_name: string
  position_name: string
  headcount: number
  requirements: string
  status: string
  created_at: string
}

interface Department {
  id: string
  name: string
}

export default function Demands() {
  const [demands, setDemands] = useState<Demand[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add')
  const [currentDemand, setCurrentDemand] = useState<Demand | null>(null)
  const [formData, setFormData] = useState({
    dept_id: '',
    position_name: '',
    headcount: 1,
    requirements: ''
  })

  useEffect(() => {
    fetchDemands()
    fetchDepartments()
  }, [])

  const fetchDemands = async () => {
    try {
      const response = await fetch('/api/recruitment/demands')
      const data = await response.json()
      if (data.success) {
        setDemands(data.data)
      }
    } catch (error) {
      console.error('获取招聘需求失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments')
      const data = await response.json()
      if (data.success) {
        setDepartments(data.data)
      }
    } catch (error) {
      console.error('获取部门列表失败:', error)
    }
  }

  const handleAdd = () => {
    setModalType('add')
    setFormData({
      dept_id: '',
      position_name: '',
      headcount: 1,
      requirements: ''
    })
    setShowModal(true)
  }

  const handleEdit = (demand: Demand) => {
    setModalType('edit')
    setCurrentDemand(demand)
    setFormData({
      dept_id: demand.dept_id || '',
      position_name: demand.position_name,
      headcount: demand.headcount,
      requirements: demand.requirements
    })
    setShowModal(true)
  }

  const handleView = (demand: Demand) => {
    setModalType('view')
    setCurrentDemand(demand)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该招聘需求吗？')) return
    
    try {
      const response = await fetch(`/api/recruitment/demands/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        fetchDemands()
      } else {
        alert(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除招聘需求失败:', error)
      alert('删除失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = modalType === 'add' ? '/api/recruitment/demands' : `/api/recruitment/demands/${currentDemand?.id}`
      const method = modalType === 'add' ? 'POST' : 'PUT'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      if (data.success) {
        setShowModal(false)
        fetchDemands()
      } else {
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      alert('操作失败')
    }
  }

  const filteredDemands = demands.filter(d =>
    d.position_name.includes(searchTerm) || d.dept_name.includes(searchTerm)
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
        <button 
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
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
                    <div className="text-sm font-medium text-slate-900">{demand.position_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{demand.dept_name}</div>
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
                    {demand.created_at}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleView(demand)}
                        className="text-blue-600 hover:text-blue-900"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(demand)}
                        className="text-green-600 hover:text-green-900"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(demand.id)}
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
            共 {filteredDemands.length} 条记录
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {modalType === 'add' ? '提交招聘需求' : modalType === 'edit' ? '编辑招聘需求' : '需求详情'}
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
                    <label className="text-sm font-medium text-slate-700">职位名称</label>
                    <p className="mt-1 text-slate-900">{currentDemand?.position_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">需求部门</label>
                    <p className="mt-1 text-slate-900">{currentDemand?.dept_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">招聘人数</label>
                    <p className="mt-1 text-slate-900">{currentDemand?.headcount} 人</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">状态</label>
                    <div className="mt-1">
                      {currentDemand && getStatusBadge(currentDemand.status)}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700">任职要求</label>
                    <p className="mt-1 text-slate-900 whitespace-pre-wrap">{currentDemand?.requirements}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">提交日期</label>
                    <p className="mt-1 text-slate-900">{currentDemand?.created_at}</p>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">需求部门 *</label>
                  <select
                    value={formData.dept_id}
                    onChange={(e) => setFormData({ ...formData, dept_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">请选择部门</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">职位名称 *</label>
                  <input
                    type="text"
                    value={formData.position_name}
                    onChange={(e) => setFormData({ ...formData, position_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">招聘人数 *</label>
                  <input
                    type="number"
                    value={formData.headcount}
                    onChange={(e) => setFormData({ ...formData, headcount: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">任职要求 *</label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows={4}
                    placeholder="请输入任职要求、岗位职责等要求..."
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
