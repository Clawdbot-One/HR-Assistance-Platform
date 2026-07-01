import { useState, useEffect } from 'react'
import { Eye, X, Users, Star } from 'lucide-react'

interface Application {
  id: string
  employee_name: string
  dept_name: string
  current_position_name: string
  target_position_name: string
  plan_title: string
  status: string
}

export default function DemocraticReview() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [currentApp, setCurrentApp] = useState<any>(null)
  const [reviewForm, setReviewForm] = useState({
    virtue_score: 80,
    ability_score: 80,
    diligence_score: 80,
    performance_score: 80,
    integrity_score: 80,
    review_comment: ''
  })

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/promotion/applications?status=qualification_passed&limit=100')
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
          virtue_score: 80,
          ability_score: 80,
          diligence_score: 80,
          performance_score: 80,
          integrity_score: 80,
          review_comment: ''
        })
        setShowModal(true)
      }
    } catch (error) {
      console.error('获取申请详情失败:', error)
    }
  }

  const handleSubmitReview = async () => {
    if (!currentApp) return

    const total_score = Math.round(
      (reviewForm.virtue_score + reviewForm.ability_score + 
       reviewForm.diligence_score + reviewForm.performance_score + 
       reviewForm.integrity_score) / 5
    )

    try {
      const response = await fetch('/api/promotion/democratic-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: currentApp.id,
          reviewer_id: 'emp-001',
          review_type: 'meeting',
          virtue_score: reviewForm.virtue_score,
          ability_score: reviewForm.ability_score,
          diligence_score: reviewForm.diligence_score,
          performance_score: reviewForm.performance_score,
          integrity_score: reviewForm.integrity_score,
          total_score,
          review_comment: reviewForm.review_comment,
          review_date: new Date().toISOString().split('T')[0]
        })
      })

      const data = await response.json()
      if (data.success) {
        setShowModal(false)
        fetchApplications()
        alert('民主评议提交成功')
      } else {
        alert(data.error || '提交失败')
      }
    } catch (error) {
      console.error('提交评议失败:', error)
      alert('提交失败')
    }
  }

  const handleCompleteReview = async (appId: string) => {
    if (!confirm('确认完成该申请的所有民主评议？')) return

    try {
      const response = await fetch(`/api/promotion/applications/${appId}/complete-democratic-review`, {
        method: 'POST'
      })

      const data = await response.json()
      if (data.success) {
        fetchApplications()
        alert('民主评议阶段完成')
      } else {
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      alert('操作失败')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
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
        <h1 className="text-2xl font-bold text-slate-800">民主评议</h1>
        <p className="text-slate-500 mt-1">对通过资格审查的申请人进行民主评议，从德、能、勤、绩、廉五个维度进行评价</p>
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-cyan-100 text-cyan-800">
                      待评议
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleReview(app)}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <Star className="w-4 h-4" />
                        <span>评议</span>
                      </button>
                      <button 
                        onClick={() => handleCompleteReview(app.id)}
                        className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                      >
                        <Users className="w-4 h-4" />
                        <span>完成评议</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {applications.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">暂无待评议的晋升申请</p>
          </div>
        )}
      </div>

      {/* 评议模态框 */}
      {showModal && currentApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">民主评议</h3>
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
                </div>
              </div>

              {/* 五维评分 */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">五维评分（满分100分）</h4>
                <div className="space-y-4">
                  {[
                    { key: 'virtue_score', label: '德', desc: '政治品质、道德品行、职业道德', color: 'bg-blue-500' },
                    { key: 'ability_score', label: '能', desc: '工作能力、专业素养、技术技能', color: 'bg-green-500' },
                    { key: 'diligence_score', label: '勤', desc: '精神状态、工作作风、敬业精神', color: 'bg-yellow-500' },
                    { key: 'performance_score', label: '绩', desc: '工作数量、质量、时效、社会效益', color: 'bg-purple-500' },
                    { key: 'integrity_score', label: '廉', desc: '廉洁自律、遵规守纪', color: 'bg-red-500' }
                  ].map((item) => (
                    <div key={item.key} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-sm font-medium text-slate-700">{item.label}</span>
                          <span className="text-xs text-slate-500 ml-2">{item.desc}</span>
                        </div>
                        <span className={`text-lg font-bold ${getScoreColor(reviewForm[item.key as keyof typeof reviewForm] as number)}`}>
                          {reviewForm[item.key as keyof typeof reviewForm]}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={reviewForm[item.key as keyof typeof reviewForm]}
                        onChange={(e) => setReviewForm({ ...reviewForm, [item.key]: parseInt(e.target.value) })}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${item.color} 0%, ${item.color} ${reviewForm[item.key as keyof typeof reviewForm]}%, #e2e8f0 ${reviewForm[item.key as keyof typeof reviewForm]}%, #e2e8f0 100%)`
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* 综合得分 */}
                <div className="mt-4 bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-slate-500">综合得分</p>
                  <p className={`text-3xl font-bold ${getScoreColor(
                    Math.round((reviewForm.virtue_score + reviewForm.ability_score + 
                              reviewForm.diligence_score + reviewForm.performance_score + 
                              reviewForm.integrity_score) / 5)
                  )}`}>
                    {Math.round((reviewForm.virtue_score + reviewForm.ability_score + 
                                reviewForm.diligence_score + reviewForm.performance_score + 
                                reviewForm.integrity_score) / 5)}
                  </p>
                </div>
              </div>

              {/* 评议意见 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">评议意见</label>
                <textarea
                  value={reviewForm.review_comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, review_comment: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="请输入评议意见..."
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
                  onClick={handleSubmitReview}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  提交评议
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
