import { Router, type Request, type Response } from 'express'
import { getDatabase } from '../db.js'

const router = Router()

// 获取考勤记录列表
router.get('/records', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT a.*, e.name as employee_name, d.name as dept_name
      FROM attendance a
      LEFT JOIN employee e ON a.employee_id = e.id
      LEFT JOIN department d ON e.dept_id = d.id
      ORDER BY a.date DESC, a.check_in DESC
    `)
    
    const records = []
    while (stmt.step()) {
      records.push(stmt.getAsObject())
    }
    stmt.free()

    res.json({
      success: true,
      data: records
    })
  } catch (error) {
    console.error('获取考勤记录失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

// 获取单个考勤记录
router.get('/records/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT a.*, e.name as employee_name, d.name as dept_name
      FROM attendance a
      LEFT JOIN employee e ON a.employee_id = e.id
      LEFT JOIN department d ON e.dept_id = d.id
      WHERE a.id = ?
    `)
    stmt.bind([req.params.id])
    
    let record = null
    if (stmt.step()) {
      record = stmt.getAsObject()
    }
    stmt.free()

    if (!record) {
      res.status(404).json({
        success: false,
        error: '考勤记录不存在'
      })
      return
    }

    res.json({
      success: true,
      data: record
    })
  } catch (error) {
    console.error('获取考勤记录详情失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

export default router
