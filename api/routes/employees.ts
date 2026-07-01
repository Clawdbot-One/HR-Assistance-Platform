import { Router, type Request, type Response } from 'express'
import { getDatabase, saveDatabase } from '../db.js'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// 获取员工列表
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT e.*, d.name as dept_name, p.name as position_name
      FROM employee e
      LEFT JOIN department d ON e.dept_id = d.id
      LEFT JOIN position p ON e.position_id = p.id
      ORDER BY e.created_at DESC
    `)
    
    const employees = []
    while (stmt.step()) {
      employees.push(stmt.getAsObject())
    }
    stmt.free()

    res.json({
      success: true,
      data: employees
    })
  } catch (error) {
    console.error('获取员工列表失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

// 获取单个员工
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT e.*, d.name as dept_name, p.name as position_name
      FROM employee e
      LEFT JOIN department d ON e.dept_id = d.id
      LEFT JOIN position p ON e.position_id = p.id
      WHERE e.id = ?
    `)
    stmt.bind([req.params.id])
    
    let employee = null
    if (stmt.step()) {
      employee = stmt.getAsObject()
    }
    stmt.free()

    if (!employee) {
      res.status(404).json({
        success: false,
        error: '员工不存在'
      })
      return
    }

    res.json({
      success: true,
      data: employee
    })
  } catch (error) {
    console.error('获取员工详情失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

// 创建员工
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, id_number, dept_id, position_id, entry_date, birth_date, phone, email } = req.body
    
    if (!name || !id_number || !dept_id) {
      res.status(400).json({
        success: false,
        error: '缺少必填字段'
      })
      return
    }

    const db = getDatabase()
    const id = `emp-${uuidv4()}`
    
    db.run(`
      INSERT INTO employee (id, name, id_number, dept_id, position_id, entry_date, birth_date, phone, email, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [id, name, id_number, dept_id, position_id || null, entry_date || null, birth_date || null, phone || null, email || null])
    
    saveDatabase()

    res.json({
      success: true,
      data: { id }
    })
  } catch (error) {
    console.error('创建员工失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

// 更新员工
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, id_number, dept_id, position_id, entry_date, birth_date, phone, email, status } = req.body
    
    const db = getDatabase()
    
    // 检查员工是否存在
    const checkStmt = db.prepare('SELECT id FROM employee WHERE id = ?')
    checkStmt.bind([req.params.id])
    if (!checkStmt.step()) {
      checkStmt.free()
      res.status(404).json({
        success: false,
        error: '员工不存在'
      })
      return
    }
    checkStmt.free()

    db.run(`
      UPDATE employee
      SET name = ?, id_number = ?, dept_id = ?, position_id = ?, entry_date = ?, birth_date = ?, phone = ?, email = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, id_number, dept_id, position_id || null, entry_date || null, birth_date || null, phone || null, email || null, status || 'active', req.params.id])
    
    saveDatabase()

    res.json({
      success: true,
      message: '更新成功'
    })
  } catch (error) {
    console.error('更新员工失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

// 删除员工
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDatabase()
    
    // 检查员工是否存在
    const checkStmt = db.prepare('SELECT id FROM employee WHERE id = ?')
    checkStmt.bind([req.params.id])
    if (!checkStmt.step()) {
      checkStmt.free()
      res.status(404).json({
        success: false,
        error: '员工不存在'
      })
      return
    }
    checkStmt.free()

    db.run('DELETE FROM employee WHERE id = ?', [req.params.id])
    saveDatabase()

    res.json({
      success: true,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除员工失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

export default router
