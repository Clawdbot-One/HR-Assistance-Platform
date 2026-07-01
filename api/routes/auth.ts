/**
 * 用户认证 API 路由
 */
import { Router, type Request, type Response } from 'express'
import { getDatabase } from '../db.js'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

/**
 * 用户登录
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: '用户名和密码不能为空'
      })
      return
    }

    const db = getDatabase()
    
    // 查询用户
    const stmt = db.prepare(`
      SELECT u.*, e.name as employee_name, e.dept_id, e.position_id, d.name as dept_name
      FROM user u
      LEFT JOIN employee e ON u.employee_id = e.id
      LEFT JOIN department d ON e.dept_id = d.id
      WHERE u.username = ? AND u.password = ?
    `)
    stmt.bind([username, password])
    
    let user = null
    if (stmt.step()) {
      user = stmt.getAsObject()
    }
    stmt.free()

    if (!user) {
      res.status(401).json({
        success: false,
        error: '用户名或密码错误'
      })
      return
    }

    // 生成简单的 token（实际项目应使用 JWT）
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          employeeId: user.employee_id,
          employeeName: user.employee_name,
          deptId: user.dept_id,
          deptName: user.dept_name,
          positionId: user.position_id
        }
      }
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

/**
 * 用户登出
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    // 实际项目应该在这里使 token 失效
    res.json({
      success: true,
      message: '登出成功'
    })
  } catch (error) {
    console.error('登出失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: '未授权访问'
      })
      return
    }

    const token = authHeader.substring(7)
    const userId = Buffer.from(token, 'base64').toString('utf-8').split(':')[0]

    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT u.*, e.name as employee_name, e.dept_id, e.position_id, d.name as dept_name
      FROM user u
      LEFT JOIN employee e ON u.employee_id = e.id
      LEFT JOIN department d ON e.dept_id = d.id
      WHERE u.id = ?
    `)
    stmt.bind([userId])
    
    let user = null
    if (stmt.step()) {
      user = stmt.getAsObject()
    }
    stmt.free()

    if (!user) {
      res.status(404).json({
        success: false,
        error: '用户不存在'
      })
      return
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        employeeId: user.employee_id,
        employeeName: user.employee_name,
        deptId: user.dept_id,
        deptName: user.dept_name,
        positionId: user.position_id
      }
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

export default router
