import { Plus, Eye, Edit, Trash2, X } from 'lucide-react'
import { useState } from 'react'

interface PromotionPlan {
  id: string
  title: string
  positionName: string
  quota: number
  requirements: string
  startDate: string
  endDate: string
  status: string
}

export default function Plans() {
  const [plans, setPlans] = useState<PromotionPlan[]>([
    {
      id: 'prom-001',
      title: '2024年度技术岗位晋升',
      positionName: '高级工程师',
      quota: 5,
      requirements: '任职满3年，绩效优秀',
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      status: 'active'
    }
  ])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add')
  const [currentPlan, setCurrentPlan] = useState<PromotionPlan | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    positionName: '',
    quota: 1,
    requirements: '',
    startDate: '',
    endDate: ''
  })

  const handleAdd = () => {
    setModalType('add')
    setFormData({
      title: '',
      positionName: '',
      quota: 1,
      requirements: '',
      startDate: '',
      endDate: ''
    })
    setShowModal(true)
  }

  const handleEdit = (plan: PromotionPlan) => {
    setModalType('edit')
    setCurrentPlan(plan)
    setFormData({
      title: plan.title,
      positionName: plan.positionName,
      quota: plan.quota,
      requirements: plan.requirements,
      startDate: plan.startDate,
      endDate: plan.endDate
    })
    setShowModal(true)
  }

  const handleView = (plan: PromotionPlan) => {
    setModalType('view')
    setCurrentPlan(plan)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除该晋升计划吗？')) return
    setPlans(plans.filter(p => p.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (modalType === 'add') {
      const newPlan: PromotionPlan = {
        id: `prom-${Date.now()}`,
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
          <h1 className="text-2xl font-bold text-slate-800">晋升计划管理</h1>
          <p className="text-slate-500 mt-1">制定和管理员工晋升计划</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>创建计划</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{plan.title}</h3>
                <p className="text-sm text-slate-500 mt-1">晋升岗位：{plan.positionName}</p>
              </div>
              {getStatusBadge(plan.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-500">晋升名额</p>
                <p className="text-lg font-semibold text-slate-800">{plan.quota} 人</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">申报周期</p>
                <p className="text-sm text-slate-800">{plan.startDate} ~ {plan.endDate}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-500 mb-1">晋升条件</p>
              <p className="text-sm text-slate-700">{plan.requirements}</p>
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
                {modalType === 'add' ? '创建晋升计划' : modalType === 'edit' ? '编辑晋升计划' : '计划详情'}
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
                    <label className="text-sm font-medium text-slate-700">计划名称</label>
                    <p className="mt-1 text-slate-900">{currentPlan?.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">晋升岗位</label>
                    <p className="mt-1 text-slate-900">{currentPlan?.positionName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">晋升名额</label>
                    <p className="mt-1 text-lg font-semibold text-slate-800">{currentPlan?.quota} 人</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">状态</label>
                    <div className="mt-1">
                      {currentPlan && getStatusBadge(currentPlan.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">申报周期</label>
                    <p className="mt-1 text-slate-900">{currentPlan?.startDate} ~ {currentPlan?.endDate}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700">晋升条件</label>
                    <p className="mt-1 text-slate-900 whitespace-pre-wrap">{currentPlan?.requirements}</p>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">计划名称 *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">晋升岗位 *</label>
                  <input
                    type="text"
                    value={formData.positionName}
                    onChange={(e) => setFormData({ ...formData, positionName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">晋升名额 *</label>
                  <input
                    type="number"
                    value={formData.quota}
                    onChange={(e) => setFormData({ ...formData, quota: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    min="1"
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

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">晋升条件 *</label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows={4}
                    placeholder="请输入晋升条件和要求..."
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
