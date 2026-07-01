import { useState } from 'react'
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react'

interface Employee {
  id: string
  name: string
  idNumber: string
  deptName: string
  positionName: string
  status: string
  entryDate: string
  phone: string
  email: string
}

export default function Employees() {
  const [employees] = useState<Employee[]>([
    {
      id: 'emp-001',
      name: '张三',
      idNumber: '110101199001011234',
      deptName: '人事部',
      positionName: '人事经理',
      status: 'active',
      entryDate: '2020-01-01',
      phone: '13800138000',
      email: 'zhangsan@example.com'
    },
    {
      id: 'emp-002',
      name: '李四',
      idNumber: '110101199201011234',
      deptName: '技术部',
      positionName: '技术总监',
      status: 'active',
      entryDate: '2019-03-15',
      phone: '13800138001',
      email: 'lisi@example.com'
    },
    {
      id: 'emp-003',
      name: '王五',
      idNumber: '110101199301011234',
      deptName: '市场部',
      positionName: '市场经理',
      status: 'active',
      entryDate: '2021-06-01',
      phone: '13800138002',
      email: 'wangwu@example.com'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')

  const filteredEmployees = employees.filter(emp =>
    emp.name.includes(searchTerm) || emp.idNumber.includes(searchTerm)
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">员工管理</h1>
          <p className="text-slate-500 mt-1">管理所有员工信息和档案</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="w-5 h-5" />
          <span>新增员工</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索员工姓名或身份证号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">身份证号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">部门</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">岗位</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">入职日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">联系方式</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{employee.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-500">{employee.idNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{employee.deptName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{employee.positionName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {employee.status === 'active' ? '在职' : '离职'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {employee.entryDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div>{employee.phone}</div>
                    <div className="text-xs">{employee.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            共 {filteredEmployees.length} 条记录
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-slate-300 rounded text-sm hover:bg-slate-50">
              上一页
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-slate-300 rounded text-sm hover:bg-slate-50">
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
