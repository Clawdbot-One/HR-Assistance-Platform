import { Plus, Eye, Edit, Trash2, X } from 'lucide-react'
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
  const [schemes, setSchemes] = useState<PerformanceScheme[]>([
    {
      id: 'perf-001',
      name: '2024年度绩效考核方案',
      period: '年度',
      type: 'KPI',
      indicators: '工作业绩、工作能力、工作态度',
      status: 'active'
    }
  ])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add')
  const [currentScheme, setCurrentScheme] = useState<PerformanceScheme | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    period: '年度',
    type: 'KPI',
    indicators: ''
  })

  const handleAdd = () => {
    setModalType('add')
    setFormData({
      name: '',
      period: '年度',
      type: 'KPI',
      indicators: ''
    })
    setShowModal(true)
  }

  const handleEdit = (scheme: PerformanceScheme) => {
    setModalType('edit')
    setCurrentScheme(scheme)
    setFormData({
      name: scheme.name,
      period: scheme.period,
      type: scheme.type,
      indicators: scheme.indicators
    })
    setShowModal(true)
  }

  const handleView = (scheme: PerformanceScheme) => {
    setModalType('view')
    setCurrentScheme(scheme)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除该考核方案吗？')) return
    setSchemes(schemes.filter(s => s.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (modalType === 'add') {
      const newScheme: PerformanceScheme = {
        id: `perf-${Date.now()}`,
        ...formData,
        status: 'draft'
      }
      setSchemes([...schemes, newScheme])
    } else {
      setSchemes(schemes.map(s => 
        s.id === currentScheme?.id ? { ...s, ...formData } : s
      ))
    }
    setShowModal(false)
  }

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
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
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
              <button 
                onClick={() => handleView(scheme)}
                className="text-blue-600 hover:text-blue-900 text-sm flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>查看详情</span>
              </button>
              <button 
                onClick={() => handleEdit(scheme)}
                className="text-green-600 hover:text-green-900 text-sm flex items-center space-x-1"
              >
                <Edit className="w-4 h-4" />
                <span>编辑</span>
              </button>
              <button 
                onClick={() => handleDelete(scheme.id)}
                className="text-red-600 hover:text-red-900 text-sm flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>删除</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {modalType === 'add' ? '创建考核方案' : modalType === 'edit' ? '编辑考核方案' : '方案详情'}
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
                    <label className="text-sm font-medium text-slate-700">方案名称</label>
                    <p className="mt-1 text-slate-900">{currentScheme?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">考核周期</label>
                    <p className="mt-1 text-slate-900">{currentScheme?.period}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">考核方式</label>
                    <p className="mt-1 text-slate-900">{currentScheme?.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">状态</label>
                    <div className="mt-1">
                      {currentScheme && getStatusBadge(currentScheme.status)}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700">考核指标</label>
                    <p className="mt-1 text-slate-900 whitespace-pre-wrap">{currentScheme?.indicators}</p>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">方案名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">考核周期 *</label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="月度">月度</option>
                    <option value="季度">季度</option>
                    <option value="半年度">半年度</option>
                    <option value="年度">年度</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">考核方式 *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="KPI">KPI</option>
                    <option value="OKR">OKR</option>
                    <option value="360度评估">360度评估</option>
                    <option value="BSC">BSC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">考核指标 *</label>
                  <textarea
                    value={formData.indicators}
                    onChange={(e) => setFormData({ ...formData, indicators: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows={4}
                    placeholder="请输入考核指标，如：工作业绩、工作能力、工作态度等..."
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
            )}
          </div>
        </div>
      )}
    </div>
  )
}
