import { Router, type Request, type Response } from 'express'
import { getDatabase, saveDatabase } from '../db.js'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// 获取部门列表（树形结构）
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT d.*, o.name as org_name
      FROM department d
      LEFT JOIN organization o ON d.org_id = o.id
      ORDER BY d.created_at DESC
    `)
    
    const departments = []
    while (stmt.step()) {
      departments.push(stmt.getAsObject())
    }
    stmt.free()

    res.json({
      success: true,
      data: departments
    })
  } catch (error) {
    console.error('获取部门列表失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

// 获取部门树形结构
router.get('/tree', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDatabase()
    
    // 获取所有部门
    const stmt = db.prepare(`
      SELECT d.*, o.name as org_name
      FROM department d
      LEFT JOIN organization o ON d.org_id = o.id
      ORDER BY d.created_at
    `)
    
    const departments = []
    while (stmt.step()) {
      departments.push(stmt.getAsObject())
    }
    stmt.free()

    // 构建树形结构
    const tree = buildTree(departments)

    res.json({
      success: true,
      data: tree
    })
  } catch (error) {
    console.error('获取部门树失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

function buildTree(departments: any[]): any[] {
  const map = new Map()
  const roots: any[] = []

  // 先创建所有节点的映射
  departments.forEach(dept => {
    map.set(dept.id, { ...dept, children: [] })
  })

  // 构建树形结构
  departments.forEach(dept => {
    const node = map.get(dept.id)
    if (dept.parent_id && map.has(dept.parent_id)) {
      map.get(dept.parent_id).children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

// 创建部门
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, org_id, parent_id, headcount_quota } = req.body
    
    if (!name || !org_id) {
      res.status(400).json({
        success: false,
        error: '缺少必填字段'
      })
      return
    }

    const db = getDatabase()
    const id = `dept-${uuidv4()}`
    
    db.run(`
      INSERT INTO department (id, name, org_id, parent_id, headcount_quota)
      VALUES (?, ?, ?, ?, ?)
    `, [id, name, org_id, parent_id || null, headcount_quota || 0])
    
    saveDatabase()

    res.json({
      success: true,
      data: { id }
    })
  } catch (error) {
    console.error('创建部门失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

// 更新部门
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, org_id, parent_id, headcount_quota } = req.body
    
    const db = getDatabase()
    
    // 检查部门是否存在
    const checkStmt = db.prepare('SELECT id FROM department WHERE id = ?')
    checkStmt.bind([req.params.id])
    if (!checkStmt.step()) {
      checkStmt.free()
      res.status(404).json({
        success: false,
        error: '部门不存在'
      })
      return
    }
    checkStmt.free()

    db.run(`
      UPDATE department
      SET name = ?, org_id = ?, parent_id = ?, headcount_quota = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, org_id, parent_id || null, headcount_quota || 0, req.params.id])
    
    saveDatabase()

    res.json({
      success: true,
      message: '更新成功'
    })
  } catch (error) {
    console.error('更新部门失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

// 删除部门
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDatabase()
    
    // 检查部门是否存在
    const checkStmt = db.prepare('SELECT id FROM department WHERE id = ?')
    checkStmt.bind([req.params.id])
    if (!checkStmt.step()) {
      checkStmt.free()
      res.status(404).json({
        success: false,
        error: '部门不存在'
      })
      return
    }
    checkStmt.free()

    // 检查是否有子部门
    const childStmt = db.prepare('SELECT COUNT(*) as count FROM department WHERE parent_id = ?')
    childStmt.bind([req.params.id])
    childStmt.step()
    const childCount = childStmt.getAsObject().count
    childStmt.free()

    if (childCount > 0) {
      res.status(400).json({
        success: false,
        error: '该部门下有子部门，无法删除'
      })
      return
    }

    // 检查是否有员工
    const empStmt = db.prepare('SELECT COUNT(*) as count FROM employee WHERE dept_id = ?')
    empStmt.bind([req.params.id])
    empStmt.step()
    const empCount = empStmt.getAsObject().count
    empStmt.free()

    if (empCount > 0) {
      res.status(400).json({
        success: false,
        error: '该部门下有员工，无法删除'
      })
      return
    }

    db.run('DELETE FROM department WHERE id = ?', [req.params.id])
    saveDatabase()

    res.json({
      success: true,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除部门失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

export default router
