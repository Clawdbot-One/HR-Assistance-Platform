import { Router, type Request, type Response } from 'express'
import { getDatabase, saveDatabase } from '../db.js'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// 获取招聘需求列表
router.get('/demands', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT rd.*, d.name as dept_name
      FROM recruitment_demand rd
      LEFT JOIN department d ON rd.dept_id = d.id
      ORDER BY rd.created_at DESC
    `)
    
    const demands = []
    while (stmt.step()) {
      demands.push(stmt.getAsObject())
    }
    stmt.free()

    res.json({
      success: true,
      data: demands
    })
  } catch (error) {
    console.error('获取招聘需求列表失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

// 创建招聘需求
router.post('/demands', async (req: Request, res: Response): Promise<void> => {
  try {
    const { dept_id, position_name, headcount, requirements, created_by } = req.body
    
    if (!dept_id || !position_name || !headcount) {
      res.status(400).json({
        success: false,
        error: '缺少必填字段'
      })
      return
    }

    const db = getDatabase()
    const id = `dem-${uuidv4()}`
    
    db.run(`
      INSERT INTO recruitment_demand (id, dept_id, position_name, headcount, requirements, created_by, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `, [id, dept_id, position_name, headcount, requirements || null, created_by || null])
    
    saveDatabase()

    res.json({
      success: true,
      data: { id }
    })
  } catch (error) {
    console.error('创建招聘需求失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

// 更新招聘需求状态
router.put('/demands/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body
    
    const db = getDatabase()
    
    // 检查需求是否存在
    const checkStmt = db.prepare('SELECT id FROM recruitment_demand WHERE id = ?')
    checkStmt.bind([req.params.id])
    if (!checkStmt.step()) {
      checkStmt.free()
      res.status(404).json({
        success: false,
        error: '招聘需求不存在'
      })
      return
    }
    checkStmt.free()

    db.run(`
      UPDATE recruitment_demand
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, req.params.id])
    
    saveDatabase()

    res.json({
      success: true,
      message: '更新成功'
    })
  } catch (error) {
    console.error('更新招聘需求失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

// 删除招聘需求
router.delete('/demands/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDatabase()
    
    // 检查需求是否存在
    const checkStmt = db.prepare('SELECT id FROM recruitment_demand WHERE id = ?')
    checkStmt.bind([req.params.id])
    if (!checkStmt.step()) {
      checkStmt.free()
      res.status(404).json({
        success: false,
        error: '招聘需求不存在'
      })
      return
    }
    checkStmt.free()

    db.run('DELETE FROM recruitment_demand WHERE id = ?', [req.params.id])
    saveDatabase()

    res.json({
      success: true,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除招聘需求失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

export default router
