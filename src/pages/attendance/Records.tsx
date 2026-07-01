import { Search, Filter } from 'lucide-react'
import { useState } from 'react'

interface AttendanceRecord {
  id: string
  employeeName: string
  deptName: string
  date: string
  checkIn: string
  checkOut: string
  status: string
}

export default function Records() {
  const [records] = useState<AttendanceRecord[]>([
    {
      id: 'att-001',
      employeeName: '张三',
      deptName: '人事部',
      date: '2024-01-15',
      checkIn: '09:00',
      checkOut: '18:00',
      status: 'normal'
    },
    {
      id: 'att-002',
      employeeName: '李四',
      deptName: '技术部',
      date: '2024-01-15',
      checkIn: '09:15',
      checkOut: '18:30',
      status: 'late'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')

  const filteredRecords = records.filter(r =>
    r.employeeName.includes(searchTerm) || r.deptName.includes(searchTerm)
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
                    <div className="text-sm font-medium text-slate-900">{record.employeeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{record.deptName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{record.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{record.checkIn}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{record.checkOut}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
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
    </div>
  )
}
