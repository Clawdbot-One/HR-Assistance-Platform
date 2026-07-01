import { Plus, Eye, Edit, Trash2, X } from 'lucide-react'
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
  const [plans, setPlans] = useState<CadrePlan[]>([
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
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add')
  const [currentPlan, setCurrentPlan] = useState<CadrePlan | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    reviewPeriod: '年度评审',
    scope: '',
    dimensions: '',
    startDate: '',
    endDate: ''
  })

  const handleAdd = () => {
    setModalType('add')
    setFormData({
      title: '',
      reviewPeriod: '年度评审',
      scope: '',
      dimensions: '',
      startDate: '',
      endDate: ''
    })
    setShowModal(true)
  }

  const handleEdit = (plan: CadrePlan) => {
    setModalType('edit')
    setCurrentPlan(plan)
    setFormData({
      title: plan.title,
      reviewPeriod: plan.reviewPeriod,
      scope: plan.scope,
      dimensions: plan.dimensions,
      startDate: plan.startDate,
      endDate: plan.endDate
    })
    setShowModal(true)
  }

  const handleView = (plan: CadrePlan) => {
    setModalType('view')
    setCurrentPlan(plan)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除该评审方案吗？')) return
    setPlans(plans.filter(p => p.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (modalType === 'add') {
      const newPlan: CadrePlan = {
        id: `cadre-${Date.now()}`,
        ...formData,
        status: 'draft'
      }
      setPlans([...plans, newPlan])
    } else {
      setPlans(plans.map(p => 
        p.id === currentPlan?.id ? { ...p, ...formData } : p
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
          <h1 className="text-2xl font-bold text-slate-800">干部评审管理</h1>
          <p className="text-slate-500 mt-1">制定和管理干部评审方案</p>
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
              <button 
                onClick={() => handleView(plan)}
                className="text-blue-600 hover:text-blue-900 text-sm flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>查看详情</span>
              </button>
              <button 
                onClick={() => handleEdit(plan)}
                className="text-green-600 hover:text-green-900 text-sm flex items-center space-x-1"
              >
                <Edit className="w-4 h-4" />
                <span>编辑</span>
              </button>
              <button 
                onClick={() => handleDelete(plan.id)}
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
                {modalType === 'add' ? '创建评审方案' : modalType === 'edit' ? '编辑评审方案' : '方案详情'}
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
                    <label className="text-sm font-medium text-slate-700">方案标题</label>
                    <p className="mt-1 text-slate-900">{currentPlan?.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">评审周期</label>
                    <p className="mt-1 text-slate-900">{currentPlan?.reviewPeriod}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">评审范围</label>
                    <p className="mt-1 text-slate-900">{currentPlan?.scope}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">评审维度</label>
                    <p className="mt-1 text-slate-900">{currentPlan?.dimensions}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700">评审时间</label>
                    <p className="mt-1 text-slate-900">{currentPlan?.startDate} ~ {currentPlan?.endDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">状态</label>
                    <div className="mt-1">
                      {currentPlan && getStatusBadge(currentPlan.status)}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">方案标题 *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">评审周期 *</label>
                  <select
                    value={formData.reviewPeriod}
                    onChange={(e) => setFormData({ ...formData, reviewPeriod: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="年度评审">年度评审</option>
                    <option value="半年度评审">半年度评审</option>
                    <option value="季度评审">季度评审</option>
                    <option value="月度评审">月度评审</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">评审范围 *</label>
                  <input
                    type="text"
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="如：全体管理干部、技术岗位员工等"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">评审维度 *</label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="如：德、能、勤、绩、廉"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">开始日期 *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">结束日期 *</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
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
