import { Building2, ChevronRight, ChevronDown, Plus, Edit, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Department {
  id: string
  name: string
  parent_id: string | null
  leader_id: string | null
  headcount_quota: number
  children?: Department[]
}

export default function Organization() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['org-001']))

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments/tree')
      const data = await response.json()
      if (data.success) {
        setDepartments(data.data)
      }
    } catch (error) {
      console.error('获取部门列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedNodes(newExpanded)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">组织架构</h1>
          <p className="text-slate-500 mt-1">管理公司组织结构和部门信息</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="w-5 h-5" />
          <span>新增部门</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-slate-800">示例公司</span>
            <span className="text-sm text-slate-500 ml-2">组织层级：1</span>
          </div>

          <div className="ml-6 space-y-2">
            {departments.map((dept) => (
              <div key={dept.id} className="border-l-2 border-slate-200 pl-4">
                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg group">
                  <div className="flex items-center space-x-3">
                    {dept.children && dept.children.length > 0 ? (
                      <button onClick={() => toggleNode(dept.id)}>
                        {expandedNodes.has(dept.id) ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    ) : (
                      <div className="w-4" />
                    )}
                    <Building2 className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-800">{dept.name}</div>
                      <div className="text-xs text-slate-500">
                        编制：{dept.headcount_quota} 人
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-blue-600 hover:text-blue-900 p-1">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
