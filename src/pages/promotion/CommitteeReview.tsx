import { useState, useEffect } from 'react'
import { Eye, X, Users, CheckCircle, XCircle, Plus, UserPlus } from 'lucide-react'

interface Committee {
  id: string
  name: string
  plan_id: string
  plan_title?: string
  chairperson_name?: string
  member_count: number
  meeting_date: string
  status: string
}

interface Application {
  id: string
  employee_name: string
  dept_name: string
  target_position_name: string
  plan_title: string
  status: string
}

interface Employee {
  id: string
  name: string
  dept_name: string
  position_name: string
}

export default function CommitteeReview() {
  const [committees, setCommittees] = useState<Committee[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showCommitteeModal, setShowCommitteeModal] = useState(false)
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [currentCommittee, setCurrentCommittee] = useState<Committee | null>(null)
  const [currentApp, setCurrentApp] = useState<Application | null>(null)
  const [committeeMembers, setCommitteeMembers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    plan_id: '',
    chairperson_id: '',
    meeting_date: ''
  })
  const [memberForm, setMemberForm] = useState({
    employee_id: ''
  })
  const [voteForm, setVoteForm] = useState({
    vote_type: 'approve',
    vote_comment: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [commRes, appRes, empRes] = await Promise.all([
        fetch('/api/promotion/committees'),
        fetch('/api/promotion/applications?status=democratic_review_completed&limit=100'),
        fetch('/api/employees?limit=100')
      ])

      const commData = await commRes.json()
      const appData = await appRes.json()
      const empData = await empRes.json()

      if (commData.success) setCommittees(commData.data)
      if (appData.success) setApplications(appData.data)
      if (empData.success) setEmployees(empData.data)
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCommittee = () => {
    setFormData({
      name: '',
      plan_id: '',
      chairperson_id: '',
      meeting_date: ''
    })
    setShowCommitteeModal(true)
  }

  const handleSubmitCommittee = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/promotion/committees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        setShowCommitteeModal(false)
        fetchData()
        alert('评审委员会创建成功')
      } else {
        alert(data.error || '创建失败')
      }
    } catch (error) {
      console.error('创建失败:', error)
      alert('创建失败')
    }
  }

  const handleViewCommittee = async (committee: Committee) => {
    setCurrentCommittee(committee)
    try {
      const response = await fetch(`/api/promotion/committees/${committee.id}/members`)
      const data = await response.json()
      if (data.success) {
        setCommitteeMembers(data.data)
      }
    } catch (error) {
      console.error('获取委员列表失败:', error)
    }
  }

  const handleAddMember = (committee: Committee) => {
    setCurrentCommittee(committee)
    setMemberForm({ employee_id: '' })
    setShowMemberModal(true)
  }

  const handleSubmitMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentCommittee) return

    try {
      const response = await fetch(`/api/promotion/committees/${currentCommittee.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: memberForm.employee_id })
      })

      const data = await response.json()
      if (data.success) {
        setShowMemberModal(false)
        if (currentCommittee) {
          const res = await fetch(`/api/promotion/committees/${currentCommittee.id}/members`)
          const membersData = await res.json()
          if (membersData.success) setCommitteeMembers(membersData.data)
        }
        fetchData()
      } else {
        alert(data.error || '添加失败')
      }
    } catch (error) {
      console.error('添加失败:', error)
      alert('添加失败')
    }
  }

  const handleVote = (app: Application, committee: Committee) => {
    setCurrentApp(app)
    setCurrentCommittee(committee)
    setVoteForm({ vote_type: 'approve', vote_comment: '' })
    setShowVoteModal(true)
  }

  const handleSubmitVote = async () => {
    if (!currentApp || !currentCommittee) return

    try {
      const response = await fetch('/api/promotion/committee-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          committee_id: currentCommittee.id,
          application_id: currentApp.id,
          member_id: 'emp-001',
          vote_type: voteForm.vote_type,
          vote_comment: voteForm.vote_comment,
          vote_date: new Date().toISOString().split('T')[0]
        })
      })

      const data = await response.json()
      if (data.success) {
        setShowVoteModal(false)
        alert('投票提交成功')
      } else {
        alert(data.error || '投票失败')
      }
    } catch (error) {
      console.error('投票失败:', error)
      alert('投票失败')
    }
  }

  const handleCompleteCommittee = async (committeeId: string) => {
    if (!confirm('确认完成该委员会的所有评审投票？')) return

    try {
      const response = await fetch(`/api/promotion/committees/${committeeId}/complete`, {
        method: 'POST'
      })

      const data = await response.json()
      if (data.success) {
        fetchData()
        alert('评审委员会评审完成')
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
      pending: 'bg-slate-100 text-slate-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    }
    const labels: Record<string, string> = {
      pending: '待评审',
      in_progress: '评审中',
      completed: '已完成'
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">评审委员会</h1>
          <p className="text-slate-500 mt-1">组建评审委员会，对通过民主评议的申请人进行最终评审</p>
        </div>
        <button
          onClick={handleCreateCommittee}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>组建委员会</span>
        </button>
      </div>

      {/* 委员会列表 */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {committees.map((committee) => (
          <div key={committee.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{committee.name}</h3>
                <p className="text-sm text-slate-500 mt-1">关联计划：{committee.plan_title || '-'}</p>
              </div>
              {getStatusBadge(committee.status)}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-500">主任委员</p>
                <p className="text-sm text-slate-900">{committee.chairperson_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">委员人数</p>
                <p className="text-lg font-semibold text-slate-800">{committee.member_count} 人</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">评审日期</p>
                <p className="text-sm text-slate-900">{committee.meeting_date || '-'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-slate-200">
              <button
                onClick={() => handleViewCommittee(committee)}
                className="text-blue-600 hover:text-blue-900 text-sm flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>查看委员</span>
              </button>
              <button
                onClick={() => handleAddMember(committee)}
                className="text-green-600 hover:text-green-900 text-sm flex items-center space-x-1"
              >
                <UserPlus className="w-4 h-4" />
                <span>添加委员</span>
              </button>
              {committee.status !== 'completed' && (
                <button
                  onClick={() => handleCompleteCommittee(committee.id)}
                  className="text-purple-600 hover:text-purple-900 text-sm flex items-center space-x-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>完成评审</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {committees.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">暂无评审委员会</p>
          </div>
        )}
      </div>

      {/* 待评审申请列表 */}
      {applications.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">待评审申请</h2>
          <div className="bg-white rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">申请人</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">部门</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">目标岗位</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">晋升计划</th>
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
                        <div className="text-sm text-slate-900">{app.target_position_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{app.plan_title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <select
                          onChange={(e) => {
                            const committee = committees.find(c => c.id === e.target.value)
                            if (committee) handleVote(app, committee)
                          }}
                          className="text-sm border border-slate-300 rounded-lg px-2 py-1"
                          defaultValue=""
                        >
                          <option value="" disabled>选择委员会投票</option>
                          {committees.filter(c => c.status !== 'completed').map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 创建委员会模态框 */}
      {showCommitteeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">组建评审委员会</h3>
              <button onClick={() => setShowCommitteeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitCommittee} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">委员会名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">评审日期 *</label>
                <input
                  type="date"
                  value={formData.meeting_date}
                  onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowCommitteeModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">取消</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">创建</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 添加委员模态框 */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">添加委员</h3>
              <button onClick={() => setShowMemberModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {committeeMembers.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">现有委员</h4>
                  <div className="space-y-2">
                    {committeeMembers.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span className="text-sm text-slate-700">{m.name}</span>
                        <span className="text-xs text-slate-500">{m.dept_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmitMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">选择委员 *</label>
                  <select
                    value={memberForm.employee_id}
                    onChange={(e) => setMemberForm({ employee_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">请选择</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name} - {emp.dept_name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">取消</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">添加</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 投票模态框 */}
      {showVoteModal && currentApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">评审投票</h3>
              <button onClick={() => setShowVoteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-700">申请人：<span className="font-medium">{currentApp.employee_name}</span></p>
                <p className="text-sm text-slate-700 mt-1">目标岗位：<span className="font-medium">{currentApp.target_position_name}</span></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">投票选择</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setVoteForm({ ...voteForm, vote_type: 'approve' })}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      voteForm.vote_type === 'approve' ? 'bg-green-100 text-green-800 border-2 border-green-500' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>同意</span>
                  </button>
                  <button
                    onClick={() => setVoteForm({ ...voteForm, vote_type: 'reject' })}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      voteForm.vote_type === 'reject' ? 'bg-red-100 text-red-800 border-2 border-red-500' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <XCircle className="w-5 h-5" />
                    <span>反对</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">投票意见</label>
                <textarea
                  value={voteForm.vote_comment}
                  onChange={(e) => setVoteForm({ ...voteForm, vote_comment: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="请输入投票意见..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowVoteModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">取消</button>
                <button onClick={handleSubmitVote} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">提交投票</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
