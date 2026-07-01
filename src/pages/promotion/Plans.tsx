import { Plus, Eye, Edit, Trash2, X, TrendingUp, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface PromotionPlan {
  id: string
  title: string
  position_name: string
  target_position_id?: string
  target_position_name?: string
  quota: number
  requirements: string
  start_date: string
  end_date: string
  status: string
  created_by?: string
  created_by_name?: string
  application_count?: number
  created_at?: string
}

interface Position {
  id: string
  name: string
  dept_id: string
  dept_name?: string
}

export default function Plans() {
  const [plans, setPlans] = useState<PromotionPlan[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add')
  const [currentPlan, setCurrentPlan] = useState<PromotionPlan | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    position_name: '',
    target_position_id: '',
    quota: 1,
    requirements: '',
    start_date: '',
    end_date: ''
  })
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    active: 0,
    completed: 0
  })

  useEffect(() => {
    fetchPlans()
    fetchPositions()
    fetchStats()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/promotion/plans?limit=100')
      const data = await response.json()
      if (data.success) {
        setPlans(data.data)
      }
    } catch (error) {
      console.error('获取晋升计划失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/departments/positions')
      const data = await response.json()
      if (data.success) {
        setPositions(data.data)
      }
    } catch (error) {
      console.error('获取岗位列表失败:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/promotion/statistics')
      const data = await response.json()
      if (data.success) {
        setStats(data.data.plans)
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  const handleAdd = () => {
    setModalType('add')
    setFormData({
      title: '',
      position_name: '',
      target_position_id: '',
      quota: 1,
      requirements: '',
      start_date: '',
      end_date: ''
    })
    setShowModal(true)
  }

  const handleEdit = (plan: PromotionPlan) => {
    setModalType('edit')
    setCurrentPlan(plan)
    setFormData({
      title: plan.title,
      position_name: plan.position_name,
      target_position_id: plan.target_position_id || '',
      quota: plan.quota,
      requirements: plan.requirements,
      start_date: plan.start_date,
      end_date: plan.end_date
    })
    setShowModal(true)
  }

  const handleView = (plan: PromotionPlan) => {
    setModalType('view')
    setCurrentPlan(plan)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该晋升计划吗？')) return
    
    try {
      const response = await fetch(`/api/promotion/plans/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        fetchPlans()
        fetchStats()
      } else {
        alert(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除晋升计划失败:', error)
      alert('删除失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = modalType === 'add' ? '/api/promotion/plans' : `/api/promotion/plans/${currentPlan?.id}`
      const method = modalType === 'add' ? 'POST' : 'PUT'
      
      const payload = modalType === 'add' 
        ? { ...formData, created_by: 'emp-001' }
        : { ...formData, status: currentPlan?.status }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await response.json()
      if (data.success) {
        setShowModal(false)
        fetchPlans()
        fetchStats()
      } else {
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      alert('操作失败')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    const labels: Record<string, string> = {
      draft: '草稿',
      active: '进行中',
      completed: '已完成',
      cancelled: '已取消'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status] || 'bg-slate-100 text-slate-800'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getWorkflowProgress = (plan: PromotionPlan) => {
    const stages = [
      { key: 'plan', label: '计划发布', done: plan.status !== 'draft' },
      { key: 'apply', label: '申请阶段', done: (plan.application_count || 0) > 0 },
      { key: 'qual', label: '资格审查', done: false },
      { key: 'demo', label: '民主评议', done: false },
      { key: 'comm', label: '委员会评审', done: false },
      { key: 'pub', label: '公示', done: false },
      { key: 'done', label: '正式晋升', done: plan.status === 'completed' }
    ]
    return stages
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">加载中...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">职位晋升管理</h1>
          <p className="text-slate-500 mt-1">制定和管理员工晋升计划，规范晋升工作流程</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>创建计划</span>
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">计划总数</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">草稿</p>
              <p className="text-2xl font-bold text-slate-600">{stats.draft}</p>
            </div>
            <Clock className="w-8 h-8 text-slate-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">进行中</p>
              <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">已完成</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* 晋升计划列表 */}
      <div className="grid grid-cols-1 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{plan.title}</h3>
                <p className="text-sm text-slate-500 mt-1">晋升岗位：{plan.position_name}</p>
              </div>
              {getStatusBadge(plan.status)}
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-500">晋升名额</p>
                <p className="text-lg font-semibold text-slate-800">{plan.quota} 人</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">申报周期</p>
                <p className="text-sm text-slate-800">{plan.start_date} ~ {plan.end_date}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">申请人数</p>
                <p className="text-lg font-semibold text-blue-600">{plan.application_count || 0} 人</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">创建人</p>
                <p className="text-sm text-slate-800">{plan.created_by_name || '-'}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-500 mb-1">晋升条件</p>
              <p className="text-sm text-slate-700">{plan.requirements}</p>
            </div>

            {/* 工作流进度 */}
            <div className="mb-4 pt-4 border-t border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-2">工作流进度</p>
              <div className="flex items-center space-x-1">
                {getWorkflowProgress(plan).map((stage, index) => (
                  <div key={stage.key} className="flex items-center">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                      stage.done ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`ml-1 text-xs ${stage.done ? 'text-green-600' : 'text-slate-500'}`}>
                      {stage.label}
                    </span>
                    {index < 6 && (
                      <div className={`w-4 h-0.5 mx-1 ${stage.done ? 'bg-green-500' : 'bg-slate-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-slate-200">
              <button 
                onClick={() => handleView(plan)}
                className="text-blue-600 hover:text-blue-900 text-sm flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>查看详情</span>
              </button>
              {plan.status === 'draft' && (
                <>
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
                </>
              )}
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">暂无晋升计划</p>
            <button
              onClick={handleAdd}
              className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
            >
              创建第一个晋升计划
            </button>
          </div>
        )}
      </div>

      {/* 模态框 */}
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
                    <p className="mt-1 text-slate-900">{currentPlan?.position_name}</p>
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
                    <p className="mt-1 text-slate-900">{currentPlan?.start_date} ~ {currentPlan?.end_date}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">申请人数</label>
                    <p className="mt-1 text-lg font-semibold text-blue-600">{currentPlan?.application_count || 0} 人</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700">晋升条件</label>
                    <p className="mt-1 text-slate-900 whitespace-pre-wrap">{currentPlan?.requirements}</p>
                  </div>
                </div>

                {/* 工作流进度 */}
                {currentPlan && (
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-3">晋升工作流</p>
                    <div className="space-y-2">
                      {getWorkflowProgress(currentPlan).map((stage, index) => (
                        <div key={stage.key} className="flex items-center space-x-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                            stage.done ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {index + 1}
                          </div>
                          <span className={`text-sm ${stage.done ? 'text-green-600 font-medium' : 'text-slate-500'}`}>
                            {stage.label}
                          </span>
                          {stage.done && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                  <label className="block text-sm font-medium text-slate-700 mb-1">晋升岗位名称 *</label>
                  <input
                    type="text"
                    value={formData.position_name}
                    onChange={(e) => setFormData({ ...formData, position_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">目标岗位</label>
                  <select
                    value={formData.target_position_id}
                    onChange={(e) => setFormData({ ...formData, target_position_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">请选择目标岗位</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>{pos.name}</option>
                    ))}
                  </select>
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
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">结束日期 *</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
                    placeholder="请输入晋升条件和要求，如：&#10;1. 在当前岗位工作满2年&#10;2. 近两年绩效考核均为良好及以上&#10;3. 无违纪记录&#10;4. 具备目标岗位所需的专业能力"
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
