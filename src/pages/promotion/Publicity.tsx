import { useState, useEffect } from 'react'
import { Eye, X, Megaphone, Plus, AlertTriangle, CheckCircle } from 'lucide-react'

interface Publicity {
  id: string
  application_id: string
  employee_name: string
  dept_name: string
  target_position_name: string
  publicity_start_date: string
  publicity_end_date: string
  publicity_channel: string
  status: string
  objection_count: number
}

export default function Publicity() {
  const [publicityList, setPublicityList] = useState<Publicity[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showObjectionModal, setShowObjectionModal] = useState(false)
  const [currentPublicity, setCurrentPublicity] = useState<Publicity | null>(null)
  const [currentDetail, setCurrentDetail] = useState<any>(null)
  const [createForm, setCreateForm] = useState({
    application_id: '',
    publicity_start_date: '',
    publicity_end_date: '',
    publicity_channel: '内部公告栏'
  })
  const [objectionForm, setObjectionForm] = useState({
    objector_name: '',
    objector_contact: '',
    objection_content: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [pubRes, appRes] = await Promise.all([
        fetch('/api/promotion/publicity'),
        fetch('/api/promotion/applications?status=committee_passed&limit=100')
      ])

      const pubData = await pubRes.json()
      const appData = await appRes.json()

      if (pubData.success) setPublicityList(pubData.data)
      if (appData.success) setApplications(appData.data)
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setCreateForm({
      application_id: '',
      publicity_start_date: new Date().toISOString().split('T')[0],
      publicity_end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      publicity_channel: '内部公告栏'
    })
    setShowCreateModal(true)
  }

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/promotion/publicity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      })

      const data = await response.json()
      if (data.success) {
        setShowCreateModal(false)
        fetchData()
        alert('公示创建成功')
      } else {
        alert(data.error || '创建失败')
      }
    } catch (error) {
      console.error('创建失败:', error)
      alert('创建失败')
    }
  }

  const handleViewDetail = async (publicity: Publicity) => {
    setCurrentPublicity(publicity)
    try {
      const response = await fetch(`/api/promotion/applications/${publicity.application_id}`)
      const data = await response.json()
      if (data.success) {
        setCurrentDetail(data.data)
        setShowDetailModal(true)
      }
    } catch (error) {
      console.error('获取详情失败:', error)
    }
  }

  const handleAddObjection = (publicity: Publicity) => {
    setCurrentPublicity(publicity)
    setObjectionForm({
      objector_name: '',
      objector_contact: '',
      objection_content: ''
    })
    setShowObjectionModal(true)
  }

  const handleSubmitObjection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPublicity) return

    try {
      const response = await fetch(`/api/promotion/publicity/${currentPublicity.id}/objections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...objectionForm,
          objection_date: new Date().toISOString().split('T')[0]
        })
      })

      const data = await response.json()
      if (data.success) {
        setShowObjectionModal(false)
        fetchData()
        alert('异议提交成功')
      } else {
        alert(data.error || '提交失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('提交失败')
    }
  }

  const handleCompletePublicity = async (publicityId: string) => {
    if (!confirm('确认完成该公示？完成后将无法再提交异议。')) return

    try {
      const response = await fetch(`/api/promotion/publicity/${publicityId}/complete`, {
        method: 'POST'
      })

      const data = await response.json()
      if (data.success) {
        fetchData()
        alert('公示完成')
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
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    }
    const labels: Record<string, string> = {
      pending: '公示中',
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
          <h1 className="text-2xl font-bold text-slate-800">公示管理</h1>
          <p className="text-slate-500 mt-1">对通过评审委员会评审的申请人进行公示，接受群众监督</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>创建公示</span>
        </button>
      </div>

      {/* 公示列表 */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {publicityList.map((publicity) => (
          <div key={publicity.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{publicity.employee_name} - 晋升公示</h3>
                <p className="text-sm text-slate-500 mt-1">目标岗位：{publicity.target_position_name} | 部门：{publicity.dept_name}</p>
              </div>
              {getStatusBadge(publicity.status)}
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-500">公示开始日期</p>
                <p className="text-sm text-slate-900">{publicity.publicity_start_date}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">公示结束日期</p>
                <p className="text-sm text-slate-900">{publicity.publicity_end_date}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">公示渠道</p>
                <p className="text-sm text-slate-900">{publicity.publicity_channel}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">收到异议</p>
                <p className="text-lg font-semibold text-slate-800">{publicity.objection_count} 件</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-slate-200">
              <button
                onClick={() => handleViewDetail(publicity)}
                className="text-blue-600 hover:text-blue-900 text-sm flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>查看详情</span>
              </button>
              {publicity.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleAddObjection(publicity)}
                    className="text-orange-600 hover:text-orange-900 text-sm flex items-center space-x-1"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>提交异议</span>
                  </button>
                  <button
                    onClick={() => handleCompletePublicity(publicity.id)}
                    className="text-green-600 hover:text-green-900 text-sm flex items-center space-x-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>完成公示</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {publicityList.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">暂无公示记录</p>
          </div>
        )}
      </div>

      {/* 创建公示模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">创建公示</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">选择申请 *</label>
                <select
                  value={createForm.application_id}
                  onChange={(e) => setCreateForm({ ...createForm, application_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">请选择</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.employee_name} - {app.target_position_name}
                    </option>
                  ))}
                </select>
                {applications.length === 0 && (
                  <p className="text-xs text-slate-500 mt-1">暂无待公示的申请</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">开始日期 *</label>
                  <input
                    type="date"
                    value={createForm.publicity_start_date}
                    onChange={(e) => setCreateForm({ ...createForm, publicity_start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">结束日期 *</label>
                  <input
                    type="date"
                    value={createForm.publicity_end_date}
                    onChange={(e) => setCreateForm({ ...createForm, publicity_end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">公示渠道 *</label>
                <select
                  value={createForm.publicity_channel}
                  onChange={(e) => setCreateForm({ ...createForm, publicity_channel: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="内部公告栏">内部公告栏</option>
                  <option value="OA系统">OA系统</option>
                  <option value="官方网站">官方网站</option>
                  <option value="部门会议">部门会议</option>
                  <option value="多渠道同时公示">多渠道同时公示</option>
                </select>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  根据规定，公示期不少于5个工作日。公示期间接受群众异议，异议需实名并提供具体事实依据。
                </p>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">取消</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">创建公示</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 详情模态框 */}
      {showDetailModal && currentDetail && currentPublicity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">公示详情</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">公示信息</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-600">公示人</p>
                    <p className="text-sm font-medium text-blue-900">{currentDetail.employee_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">部门</p>
                    <p className="text-sm font-medium text-blue-900">{currentDetail.dept_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">当前岗位</p>
                    <p className="text-sm font-medium text-blue-900">{currentDetail.current_position_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">拟晋升岗位</p>
                    <p className="text-sm font-medium text-blue-900">{currentDetail.target_position_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">公示期限</p>
                    <p className="text-sm font-medium text-blue-900">{currentPublicity.publicity_start_date} ~ {currentPublicity.publicity_end_date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">公示渠道</p>
                    <p className="text-sm font-medium text-blue-900">{currentPublicity.publicity_channel}</p>
                  </div>
                </div>
              </div>

              {currentDetail.objections && currentDetail.objections.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">异议记录</h4>
                  <div className="space-y-2">
                    {currentDetail.objections.map((obj: any, index: number) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">{obj.objector_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            obj.handling_status === 'resolved' ? 'bg-green-100 text-green-800' :
                            obj.handling_status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {obj.handling_status === 'resolved' ? '已处理' :
                             obj.handling_status === 'rejected' ? '已驳回' : '待处理'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{obj.objection_content}</p>
                        {obj.investigation_result && (
                          <p className="text-xs text-slate-500 mt-1">处理结果：{obj.investigation_result}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">关闭</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 提交异议模态框 */}
      {showObjectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">提交异议</h3>
              <button onClick={() => setShowObjectionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitObjection} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">异议人姓名 *</label>
                <input
                  type="text"
                  value={objectionForm.objector_name}
                  onChange={(e) => setObjectionForm({ ...objectionForm, objector_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">联系方式</label>
                <input
                  type="text"
                  value={objectionForm.objector_contact}
                  onChange={(e) => setObjectionForm({ ...objectionForm, objector_contact: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="电话或邮箱"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">异议内容 *</label>
                <textarea
                  value={objectionForm.objection_content}
                  onChange={(e) => setObjectionForm({ ...objectionForm, objection_content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={4}
                  placeholder="请详细描述异议内容和相关事实..."
                  required
                />
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  异议需实名提出，并提供具体事实和证据。受理部门将在15个工作日内进行调查处理并反馈结果。
                </p>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowObjectionModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">取消</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">提交异议</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
