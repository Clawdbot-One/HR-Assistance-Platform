import { Router, Request, Response } from 'express';
import { getDatabase, saveDatabase } from '../db.js';

const router = Router();

// 获取离职申请列表
router.get('/applications', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT 
        rr.*,
        e.name as employee_name,
        d.name as dept_name
      FROM resign_record rr
      LEFT JOIN employee e ON rr.employee_id = e.id
      LEFT JOIN department d ON e.dept_id = d.id
      ORDER BY rr.created_at DESC
    `);
    
    const applications = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      applications.push({
        id: row.id,
        employee_name: row.employee_name,
        dept_name: row.dept_name,
        resign_date: row.resign_date,
        resign_type: row.resign_type,
        reason: row.reason,
        status: row.status
      });
    }
    stmt.free();
    
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('获取离职申请失败:', error);
    res.status(500).json({
      success: false,
      error: '获取离职申请失败'
    });
  }
});

// 创建离职申请
router.post('/applications', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { employee_id, resign_date, resign_type, reason } = req.body;
    
    const id = `resign-${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO resign_record (id, employee_id, resign_date, resign_type, reason, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `);
    
    stmt.run([id, employee_id, resign_date, resign_type, reason || '']);
    stmt.free();
    
    saveDatabase();
    
    res.json({
      success: true,
      data: { id }
    });
  } catch (error) {
    console.error('创建离职申请失败:', error);
    res.status(500).json({
      success: false,
      error: '创建离职申请失败'
    });
  }
});

// 获取单个离职申请
router.get('/applications/:id', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT 
        rr.*,
        e.name as employee_name,
        d.name as dept_name
      FROM resign_record rr
      LEFT JOIN employee e ON rr.employee_id = e.id
      LEFT JOIN department d ON e.dept_id = d.id
      WHERE rr.id = ?
    `);
    
    stmt.bind([req.params.id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      
      res.json({
        success: true,
        data: {
          id: row.id,
          employee_name: row.employee_name,
          dept_name: row.dept_name,
          resign_date: row.resign_date,
          resign_type: row.resign_type,
          reason: row.reason,
          status: row.status
        }
      });
    } else {
      stmt.free();
      res.status(404).json({
        success: false,
        error: '离职申请不存在'
      });
    }
  } catch (error) {
    console.error('获取离职申请详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取离职申请详情失败'
    });
  }
});

// 更新离职申请状态
router.put('/applications/:id', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { status } = req.body;
    
    // 检查申请是否存在
    const checkStmt = db.prepare('SELECT id FROM resign_record WHERE id = ?');
    checkStmt.bind([req.params.id]);
    
    if (!checkStmt.step()) {
      checkStmt.free();
      res.status(404).json({
        success: false,
        error: '离职申请不存在'
      });
      return;
    }
    checkStmt.free();
    
    // 更新状态
    const updateStmt = db.prepare(`
      UPDATE resign_record 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    updateStmt.run([status, req.params.id]);
    updateStmt.free();
    
    saveDatabase();
    
    res.json({
      success: true,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新离职申请失败:', error);
    res.status(500).json({
      success: false,
      error: '更新离职申请失败'
    });
  }
});

export default router;
