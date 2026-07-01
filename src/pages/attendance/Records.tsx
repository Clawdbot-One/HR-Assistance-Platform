import { Search, Filter, Eye, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface AttendanceRecord {
  id: string
  employee_name: string
  dept_name: string
  date: string
  check_in: string
  check_out: string
  status: string
}

export default function Records() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/attendance/records')
      const data = await response.json()
      if (data.success) {
        setRecords(data.data)
      }
    } catch (error) {
      console.error('获取考勤记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleView = (record: AttendanceRecord) => {
    setCurrentRecord(record)
    setShowModal(true)
  }

  const filteredRecords = records.filter(r =>
    r.employee_name.includes(searchTerm) || r.dept_name.includes(searchTerm)
  )

  const getStatusBadge = (status: string) => {
    const badges = {
      normal: 'bg-green-100 text-green-800',
      late: 'bg-orange-100 text-orange-800',
      early: 'bg-red-100 text-red-800',
      absent: 'bg-red-100 text-red-800'
    }
    const labels = {
      normal: '正常',
      late: '迟到',
      early: '早退',
      absent: '缺勤'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">考勤记录</h1>
        <p className="text-slate-500 mt-1">查看和管理员工考勤数据</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索员工姓名或部门..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <button className="ml-4 px-4 py-2 border border-slate-300 rounded-lg flex items-center space-x-2 hover:bg-slate-50">
            <Filter className="w-5 h-5" />
            <span>筛选</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">员工姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">部门</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">上班打卡</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">下班打卡</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{record.employee_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{record.dept_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{record.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{record.check_in}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{record.check_out}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleView(record)}
                      className="text-blue-600 hover:text-blue-900"
                      title="查看详情"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-200">
          <div className="text-sm text-slate-500">
            共 {filteredRecords.length} 条记录
          </div>
        </div>
      </div>

      {showModal && currentRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">考勤详情</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">员工姓名</label>
                  <p className="mt-1 text-slate-900">{currentRecord.employee_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">部门</label>
                  <p className="mt-1 text-slate-900">{currentRecord.dept_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">日期</label>
                  <p className="mt-1 text-slate-900">{currentRecord.date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">状态</label>
                  <div className="mt-1">
                    {getStatusBadge(currentRecord.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">上班打卡</label>
                  <p className="mt-1 text-slate-900">{currentRecord.check_in || '未打卡'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">下班打卡</label>
                  <p className="mt-1 text-slate-900">{currentRecord.check_out || '未打卡'}</p>
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
          </div>
        </div>
      )}
    </div>
  )
}
