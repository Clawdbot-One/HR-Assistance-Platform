import { Building2, ChevronRight, ChevronDown, Plus, Edit, Trash2, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Department {
  id: string
  name: string
  parent_id: string | null
  leader_id: string | null
  headcount_quota: number
  children?: Department[]
}

export default function Organization() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['org-001']))
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit'>('add')
  const [currentDept, setCurrentDept] = useState<Department | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    org_id: 'org-001',
    parent_id: '',
    headcount_quota: 0
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments/tree')
      const data = await response.json()
      if (data.success) {
        setDepartments(data.data)
      }
    } catch (error) {
      console.error('获取部门列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedNodes(newExpanded)
  }

  const handleAdd = () => {
    setModalType('add')
    setFormData({
      name: '',
      org_id: 'org-001',
      parent_id: '',
      headcount_quota: 0
    })
    setShowModal(true)
  }

  const handleEdit = (dept: Department) => {
    setModalType('edit')
    setCurrentDept(dept)
    setFormData({
      name: dept.name,
      org_id: 'org-001',
      parent_id: dept.parent_id || '',
      headcount_quota: dept.headcount_quota
    })
    setShowModal(true)
  }

  const handleDelete = async (dept: Department) => {
    if (!confirm(`确定要删除部门"${dept.name}"吗？`)) return
    
    try {
      const response = await fetch(`/api/departments/${dept.id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        fetchDepartments()
      } else {
        alert(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除部门失败:', error)
      alert('删除失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = modalType === 'add' ? '/api/departments' : `/api/departments/${currentDept?.id}`
      const method = modalType === 'add' ? 'POST' : 'PUT'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      if (data.success) {
        setShowModal(false)
        fetchDepartments()
      } else {
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      alert('操作失败')
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">组织架构</h1>
          <p className="text-slate-500 mt-1">管理公司组织结构和部门信息</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>新增部门</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-slate-800">示例公司</span>
            <span className="text-sm text-slate-500 ml-2">组织层级：1</span>
          </div>

          <div className="ml-6 space-y-2">
            {departments.map((dept) => (
              <div key={dept.id} className="border-l-2 border-slate-200 pl-4">
                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg group">
                  <div className="flex items-center space-x-3">
                    {dept.children && dept.children.length > 0 ? (
                      <button onClick={() => toggleNode(dept.id)}>
                        {expandedNodes.has(dept.id) ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    ) : (
                      <div className="w-4" />
                    )}
                    <Building2 className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-800">{dept.name}</div>
                      <div className="text-xs text-slate-500">
                        编制：{dept.headcount_quota} 人
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(dept)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(dept)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {modalType === 'add' ? '新增部门' : '编辑部门'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">部门名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">上级部门</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">无（顶级部门）</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">编制人数 *</label>
                <input
                  type="number"
                  value={formData.headcount_quota}
                  onChange={(e) => setFormData({ ...formData, headcount_quota: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  min="0"
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
                  {modalType === 'add' ? '创建' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
