import { Plus, Eye, X, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface PromotionPlan {
  id: string
  title: string
  position_name: string
  target_position_id?: string
  quota: number
  requirements: string
  start_date: string
  end_date: string
  status: string
  application_count?: number
}

interface PromotionApplication {
  id: string
  plan_id: string
  employee_id: string
  employee_name?: string
  dept_name?: string
  current_position_name?: string
  target_position_name?: string
  plan_title?: string
  apply_reason: string
  work_summary: string
  achievements: string
  status: string
  submitted_at?: string
  qualification_review?: any
  demographic_reviews?: any[]
  demographic_avg?: any
  committee_reviews?: any[]
  publicity?: any
}

interface Employee {
  id: string
  name: string
  dept_name: string
  position_name: string
}

export default function Applications() {
  const [plans, setPlans] = useState<PromotionPlan[]>([])
  const [applications, setApplications] = useState<PromotionApplication[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'view'>('add')
  const [currentApplication, setCurrentApplication] = useState<PromotionApplication | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PromotionPlan | null>(null)
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    apply_reason: '',
    work_summary: '',
    achievements: ''
  })
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    qualification_passed: 0,
    committee_passed: 0,
    approved: 0
  })

  useEffect(() => {
    fetchPlans()
    fetchApplications()
    fetchEmployees()
    fetchStats()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/promotion/plans?status=active&limit=100')
      const data = await response.json()
      if (data.success) {
        setPlans(data.data)
      }
    } catch (error) {
      console.error('获取晋升计划失败:', error)
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/promotion/applications?limit=100')
      const data = await response.json()
      if (data.success) {
        setApplications(data.data)
      }
    } catch (error) {
      console.error('获取晋升申请失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees?limit=100')
      const data = await response.json()
      if (data.success) {
        setEmployees(data.data)
      }
    } catch (error) {
      console.error('获取员工列表失败:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/promotion/statistics')
      const data = await response.json()
      if (data.success) {
        setStats(data.data.applications)
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  const handleAdd = () => {
    setModalType('add')
    setSelectedPlan(null)
    setCurrentEmployee(null)
    setFormData({
      apply_reason: '',
      work_summary: '',
      achievements: ''
    })
    setShowModal(true)
  }

  const handleView = async (app: PromotionApplication) => {
    setModalType('view')
    try {
      const response = await fetch(`/api/promotion/applications/${app.id}`)
      const data = await response.json()
      if (data.success) {
        setCurrentApplication(data.data)
        setShowModal(true)
      }
    } catch (error) {
      console.error('获取申请详情失败:', error)
    }
  }

  const handlePlanSelect = (plan: PromotionPlan) => {
    setSelectedPlan(plan)
  }

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId)
    setCurrentEmployee(employee || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPlan || !currentEmployee) {
      alert('请选择晋升计划和申请人')
      return
    }

    try {
      const response = await fetch('/api/promotion/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          employee_id: currentEmployee.id,
          current_position_id: 'pos-002', // 临时使用，实际应从员工信息获取
          target_position_id: selectedPlan.target_position_id || 'pos-004',
          apply_reason: formData.apply_reason,
          work_summary: formData.work_summary,
          achievements: formData.achievements
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setShowModal(false)
        fetchApplications()
        fetchPlans()
        fetchStats()
        alert('晋升申请提交成功')
      } else {
        alert(data.error || '提交失败')
      }
    } catch (error) {
      console.error('提交申请失败:', error)
      alert('提交失败')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-800',
      qualification_passed: 'bg-cyan-100 text-cyan-800',
      qualification_rejected: 'bg-red-100 text-red-800',
      democratic_review_completed: 'bg-indigo-100 text-indigo-800',
      committee_passed: 'bg-purple-100 text-purple-800',
      committee_rejected: 'bg-red-100 text-red-800',
      publicizing: 'bg-yellow-100 text-yellow-800',
      publicity_completed: 'bg-green-100 text-green-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    const labels: Record<string, string> = {
      submitted: '已提交',
      qualification_passed: '资格审查通过',
      qualification_rejected: '资格审查未通过',
      democratic_review_completed: '民主评议完成',
      committee_passed: '委员会评审通过',
      committee_rejected: '委员会评审未通过',
      publicizing: '公示中',
      publicity_completed: '公示完成',
      approved: '已批准',
      rejected: '已驳回'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status] || 'bg-slate-100 text-slate-800'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getWorkflowStage = (status: string) => {
    const stages = [
      { key: 'submitted', label: '已提交', done: status !== '' },
      { key: 'qualification', label: '资格审查', done: ['qualification_passed', 'democratic_review_completed', 'committee_passed', 'publicizing', 'publicity_completed', 'approved'].includes(status) },
      { key: 'democratic', label: '民主评议', done: ['democratic_review_completed', 'committee_passed', 'publicizing', 'publicity_completed', 'approved'].includes(status) },
      { key: 'committee', label: '委员会评审', done: ['committee_passed', 'publicizing', 'publicity_completed', 'approved'].includes(status) },
      { key: 'publicity', label: '公示', done: ['publicizing', 'publicity_completed', 'approved'].includes(status) },
      { key: 'approved', label: '正式晋升', done: status === 'approved' }
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
          <h1 className="text-2xl font-bold text-slate-800">晋升申请管理</h1>
          <p className="text-slate-500 mt-1">管理员工晋升申请，跟踪申请进度</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>提交申请</span>
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">申请总数</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">待审查</p>
              <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">审查通过</p>
              <p className="text-2xl font-bold text-cyan-600">{stats.qualification_passed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-cyan-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">评审通过</p>
              <p className="text-2xl font-bold text-purple-600">{stats.committee_passed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">已批准</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* 申请列表 */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">申请人</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">部门</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">晋升计划</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">目标岗位</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">申请时间</th>
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
                    <div className="text-sm text-slate-500">{app.dept_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{app.plan_title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{app.target_position_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('zh-CN') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleView(app)}
                      className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 ml-auto"
                    >
                      <Eye className="w-4 h-4" />
                      <span>查看详情</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {applications.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">暂无晋升申请</p>
          </div>
        )}
      </div>

      {/* 模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {modalType === 'add' ? '提交晋升申请' : '申请详情'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalType === 'view' && currentApplication ? (
              <div className="p-6 space-y-4">
                {/* 基本信息 */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">基本信息</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-500">申请人</label>
                      <p className="text-slate-900">{currentApplication.employee_name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">部门</label>
                      <p className="text-slate-900">{currentApplication.dept_name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">当前岗位</label>
                      <p className="text-slate-900">{currentApplication.current_position_name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">目标岗位</label>
                      <p className="text-slate-900">{currentApplication.target_position_name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">晋升计划</label>
                      <p className="text-slate-900">{currentApplication.plan_title}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">申请时间</label>
                      <p className="text-slate-900">
                        {currentApplication.submitted_at ? new Date(currentApplication.submitted_at).toLocaleDateString('zh-CN') : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 申请理由 */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">申请理由</h4>
                  <p className="text-sm text-slate-900 whitespace-pre-wrap">{currentApplication.apply_reason}</p>
                </div>

                {/* 工作总结 */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">工作总结</h4>
                  <p className="text-sm text-slate-900 whitespace-pre-wrap">{currentApplication.work_summary}</p>
                </div>

                {/* 主要成绩 */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">主要成绩</h4>
                  <p className="text-sm text-slate-900 whitespace-pre-wrap">{currentApplication.achievements}</p>
                </div>

                {/* 工作流进度 */}
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">工作流进度</h4>
                  <div className="space-y-2">
                    {getWorkflowStage(currentApplication.status).map((stage, index) => (
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

                {/* 资格审查信息 */}
                {currentApplication.qualification_review && (
                  <div className="pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">资格审查结果</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-slate-500">审查人</label>
                          <p className="text-slate-900">{currentApplication.qualification_review.reviewer_name}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-500">审查日期</label>
                          <p className="text-slate-900">{currentApplication.qualification_review.review_date}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-500">工作年限</label>
                          <p className="text-slate-900">{currentApplication.qualification_review.work_years_check ? '✓ 符合' : '✗ 不符合'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-500">绩效要求</label>
                          <p className="text-slate-900">{currentApplication.qualification_review.performance_check ? '✓ 符合' : '✗ 不符合'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-500">学历要求</label>
                          <p className="text-slate-900">{currentApplication.qualification_review.education_check ? '✓ 符合' : '✗ 不符合'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-500">纪律要求</label>
                          <p className="text-slate-900">{currentApplication.qualification_review.discipline_check ? '✓ 符合' : '✗ 不符合'}</p>
                        </div>
                      </div>
                      {currentApplication.qualification_review.review_comment && (
                        <div className="mt-3">
                          <label className="text-sm text-slate-500">审查意见</label>
                          <p className="text-sm text-slate-900">{currentApplication.qualification_review.review_comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 民主评议信息 */}
                {currentApplication.demographic_reviews && currentApplication.demographic_reviews.length > 0 && (
                  <div className="pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">民主评议结果</h4>
                    {currentApplication.demographic_avg && (
                      <div className="bg-slate-50 rounded-lg p-4 mb-3">
                        <div className="grid grid-cols-5 gap-4 text-center">
                          <div>
                            <p className="text-xs text-slate-500">德</p>
                            <p className="text-lg font-semibold text-slate-900">{currentApplication.demographic_avg.virtue}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">能</p>
                            <p className="text-lg font-semibold text-slate-900">{currentApplication.demographic_avg.ability}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">勤</p>
                            <p className="text-lg font-semibold text-slate-900">{currentApplication.demographic_avg.diligence}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">绩</p>
                            <p className="text-lg font-semibold text-slate-900">{currentApplication.demographic_avg.performance}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">廉</p>
                            <p className="text-lg font-semibold text-slate-900">{currentApplication.demographic_avg.integrity}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200 text-center">
                          <p className="text-sm text-slate-500">综合得分</p>
                          <p className="text-2xl font-bold text-blue-600">{currentApplication.demographic_avg.total}</p>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-slate-500">共 {currentApplication.demographic_reviews.length} 人参与评议</p>
                  </div>
                )}

                {/* 委员会评审信息 */}
                {currentApplication.committee_reviews && currentApplication.committee_reviews.length > 0 && (
                  <div className="pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">委员会评审结果</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="space-y-2">
                        {currentApplication.committee_reviews.map((review: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-slate-700">{review.member_name}</span>
                            <span className={`text-sm font-medium ${
                              review.vote_type === 'approve' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {review.vote_type === 'approve' ? '✓ 同意' : '✗ 反对'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 公示信息 */}
                {currentApplication.publicity && (
                  <div className="pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">公示信息</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-slate-500">公示开始日期</label>
                          <p className="text-slate-900">{currentApplication.publicity.publicity_start_date}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-500">公示结束日期</label>
                          <p className="text-slate-900">{currentApplication.publicity.publicity_end_date}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-500">公示渠道</label>
                          <p className="text-slate-900">{currentApplication.publicity.publicity_channel}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-500">异议数量</label>
                          <p className="text-slate-900">{currentApplication.publicity.objection_count} 件</p>
                        </div>
                      </div>
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
                {/* 选择晋升计划 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">选择晋升计划 *</label>
                  <div className="grid grid-cols-1 gap-3">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => handlePlanSelect(plan)}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedPlan?.id === plan.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-slate-900">{plan.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">晋升岗位：{plan.position_name}</p>
                            <p className="text-xs text-slate-500 mt-1">名额：{plan.quota} 人 | 周期：{plan.start_date} ~ {plan.end_date}</p>
                          </div>
                          {selectedPlan?.id === plan.id && (
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {plans.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">暂无可申请的晋升计划</p>
                  )}
                </div>

                {/* 选择申请人 */}
                {selectedPlan && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">申请人 *</label>
                      <select
                        value={currentEmployee?.id || ''}
                        onChange={(e) => handleEmployeeSelect(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      >
                        <option value="">请选择申请人</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} - {emp.dept_name} - {emp.position_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 申请理由 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">申请理由 *</label>
                      <textarea
                        value={formData.apply_reason}
                        onChange={(e) => setFormData({ ...formData, apply_reason: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        rows={3}
                        placeholder="请说明申请晋升的理由..."
                        required
                      />
                    </div>

                    {/* 工作总结 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">工作总结 *</label>
                      <textarea
                        value={formData.work_summary}
                        onChange={(e) => setFormData({ ...formData, work_summary: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        rows={4}
                        placeholder="请总结在当前岗位的工作情况..."
                        required
                      />
                    </div>

                    {/* 主要成绩 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">主要成绩 *</label>
                      <textarea
                        value={formData.achievements}
                        onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        rows={4}
                        placeholder="请列举在现岗位期间取得的主要成绩和贡献..."
                        required
                      />
                    </div>
                  </>
                )}

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
                    disabled={!selectedPlan || !currentEmployee}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    提交申请
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
