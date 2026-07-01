import { useState, useEffect } from 'react'
import { Eye, CheckCircle, XCircle, X, UserCheck } from 'lucide-react'

interface Application {
  id: string
  employee_name: string
  dept_name: string
  current_position_name: string
  target_position_name: string
  plan_title: string
  status: string
  submitted_at: string
}

export default function QualificationReview() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [currentApp, setCurrentApp] = useState<any>(null)
  const [reviewForm, setReviewForm] = useState({
    work_years_check: 0,
    performance_check: 0,
    education_check: 0,
    discipline_check: 0,
    qualification_score: 0,
    review_comment: '',
    status: 'passed'
  })

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/promotion/applications?status=submitted&limit=100')
      const data = await response.json()
      if (data.success) {
        setApplications(data.data)
      }
    } catch (error) {
      console.error('获取申请列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (app: Application) => {
    try {
      const response = await fetch(`/api/promotion/applications/${app.id}`)
      const data = await response.json()
      if (data.success) {
        setCurrentApp(data.data)
        setReviewForm({
          work_years_check: 0,
          performance_check: 0,
          education_check: 0,
          discipline_check: 0,
          qualification_score: 0,
          review_comment: '',
          status: 'passed'
        })
        setShowModal(true)
      }
    } catch (error) {
      console.error('获取申请详情失败:', error)
    }
  }

  const handleSubmitReview = async () => {
    if (!currentApp) return

    const score = (reviewForm.work_years_check + reviewForm.performance_check + 
                   reviewForm.education_check + reviewForm.discipline_check) * 25

    try {
      const response = await fetch('/api/promotion/qualification-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: currentApp.id,
          reviewer_id: 'emp-001',
          review_date: new Date().toISOString().split('T')[0],
          work_years_check: reviewForm.work_years_check,
          performance_check: reviewForm.performance_check,
          education_check: reviewForm.education_check,
          discipline_check: reviewForm.discipline_check,
          qualification_score: score,
          review_comment: reviewForm.review_comment,
          status: reviewForm.status
        })
      })

      const data = await response.json()
      if (data.success) {
        setShowModal(false)
        fetchApplications()
        alert('资格审查完成')
      } else {
        alert(data.error || '提交失败')
      }
    } catch (error) {
      console.error('提交审查失败:', error)
      alert('提交失败')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-800',
      qualification_passed: 'bg-green-100 text-green-800',
      qualification_rejected: 'bg-red-100 text-red-800'
    }
    const labels: Record<string, string> = {
      submitted: '待审查',
      qualification_passed: '审查通过',
      qualification_rejected: '审查未通过'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status] || 'bg-slate-100 text-slate-800'}`}>
        {labels[status] || status}
      </span>
    )
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">资格审查</h1>
        <p className="text-slate-500 mt-1">对晋升申请进行资格审查，核实申请人是否符合晋升条件</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">申请人</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">部门</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">当前岗位</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">目标岗位</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">晋升计划</th>
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
                    <div className="text-sm text-slate-900">{app.current_position_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{app.target_position_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{app.plan_title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('zh-CN') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleReview(app)}
                      className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 ml-auto"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>审查</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {applications.length === 0 && (
          <div className="p-12 text-center">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">暂无待审查的晋升申请</p>
          </div>
        )}
      </div>

      {/* 审查模态框 */}
      {showModal && currentApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">资格审查</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* 申请人信息 */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">申请人信息</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-500">姓名</label>
                    <p className="text-slate-900">{currentApp.employee_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">部门</label>
                    <p className="text-slate-900">{currentApp.dept_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">当前岗位</label>
                    <p className="text-slate-900">{currentApp.current_position_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">目标岗位</label>
                    <p className="text-slate-900">{currentApp.target_position_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">入职日期</label>
                    <p className="text-slate-900">{currentApp.entry_date || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">晋升计划</label>
                    <p className="text-slate-900">{currentApp.plan_title}</p>
                  </div>
                </div>
              </div>

              {/* 晋升条件 */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">晋升条件要求</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap bg-yellow-50 p-3 rounded-lg">
                  {currentApp.plan_requirements || '暂无要求'}
                </p>
              </div>

              {/* 审查项目 */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">审查项目</h4>
                <div className="space-y-3">
                  {[
                    { key: 'work_years_check', label: '工作年限', desc: '是否满足岗位要求的最低工作年限' },
                    { key: 'performance_check', label: '绩效要求', desc: '近期绩效考核是否达到良好及以上' },
                    { key: 'education_check', label: '学历要求', desc: '是否满足目标岗位的学历要求' },
                    { key: 'discipline_check', label: '纪律要求', desc: '近一年内是否有违纪记录' }
                  ].map((item) => (
                    <div key={item.key} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setReviewForm({ ...reviewForm, [item.key]: 1 })}
                            className={`px-3 py-1 text-xs rounded-full transition-colors ${
                              reviewForm[item.key as keyof typeof reviewForm] === 1
                                ? 'bg-green-100 text-green-800'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            ✓ 符合
                          </button>
                          <button
                            onClick={() => setReviewForm({ ...reviewForm, [item.key]: 0 })}
                            className={`px-3 py-1 text-xs rounded-full transition-colors ${
                              reviewForm[item.key as keyof typeof reviewForm] === 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            ✗ 不符合
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 审查意见 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">审查意见</label>
                <textarea
                  value={reviewForm.review_comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, review_comment: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="请输入审查意见..."
                />
              </div>

              {/* 审查结论 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">审查结论</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setReviewForm({ ...reviewForm, status: 'passed' })}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      reviewForm.status === 'passed'
                        ? 'bg-green-100 text-green-800 border-2 border-green-500'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>通过</span>
                  </button>
                  <button
                    onClick={() => setReviewForm({ ...reviewForm, status: 'rejected' })}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      reviewForm.status === 'rejected'
                        ? 'bg-red-100 text-red-800 border-2 border-red-500'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <XCircle className="w-5 h-5" />
                    <span>不通过</span>
                  </button>
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
                  onClick={handleSubmitReview}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  提交审查结果
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
