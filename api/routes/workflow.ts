import { Router, Request, Response } from 'express';
import { getDatabase, saveDatabase } from '../db.js';

const router = Router();

// 获取审批任务列表
router.get('/tasks', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT 
        at.*,
        e.name as applicant_name,
        d.name as dept_name
      FROM approval_task at
      LEFT JOIN employee e ON at.applicant_id = e.id
      LEFT JOIN department d ON e.dept_id = d.id
      ORDER BY at.created_at DESC
    `);
    
    const tasks = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      tasks.push({
        id: row.id,
        title: row.title,
        business_type: row.business_type,
        applicant_name: row.applicant_name,
        dept_name: row.dept_name,
        status: row.status,
        created_at: row.created_at
      });
    }
    stmt.free();
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('获取审批任务失败:', error);
    res.status(500).json({
      success: false,
      error: '获取审批任务失败'
    });
  }
});

// 获取单个审批任务
router.get('/tasks/:id', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT 
        at.*,
        e.name as applicant_name,
        d.name as dept_name
      FROM approval_task at
      LEFT JOIN employee e ON at.applicant_id = e.id
      LEFT JOIN department d ON e.dept_id = d.id
      WHERE at.id = ?
    `);
    
    stmt.bind([req.params.id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      
      res.json({
        success: true,
        data: {
          id: row.id,
          title: row.title,
          business_type: row.business_type,
          applicant_name: row.applicant_name,
          dept_name: row.dept_name,
          status: row.status,
          created_at: row.created_at
        }
      });
    } else {
      stmt.free();
      res.status(404).json({
        success: false,
        error: '审批任务不存在'
      });
    }
  } catch (error) {
    console.error('获取审批任务详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取审批任务详情失败'
    });
  }
});

// 审批通过
router.post('/tasks/:id/approve', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { approver_id, comment } = req.body;
    
    // 检查任务是否存在
    const checkStmt = db.prepare('SELECT id FROM approval_task WHERE id = ?');
    checkStmt.bind([req.params.id]);
    
    if (!checkStmt.step()) {
      checkStmt.free();
      res.status(404).json({
        success: false,
        error: '审批任务不存在'
      });
      return;
    }
    checkStmt.free();
    
    // 更新审批状态
    const updateStmt = db.prepare(`
      UPDATE approval_task 
      SET status = 'approved', approver_id = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    updateStmt.run([approver_id, comment || '', req.params.id]);
    updateStmt.free();
    
    saveDatabase();
    
    res.json({
      success: true,
      message: '审批通过'
    });
  } catch (error) {
    console.error('审批失败:', error);
    res.status(500).json({
      success: false,
      error: '审批失败'
    });
  }
});

// 审批驳回
router.post('/tasks/:id/reject', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { approver_id, comment } = req.body;
    
    // 检查任务是否存在
    const checkStmt = db.prepare('SELECT id FROM approval_task WHERE id = ?');
    checkStmt.bind([req.params.id]);
    
    if (!checkStmt.step()) {
      checkStmt.free();
      res.status(404).json({
        success: false,
        error: '审批任务不存在'
      });
      return;
    }
    checkStmt.free();
    
    // 更新审批状态
    const updateStmt = db.prepare(`
      UPDATE approval_task 
      SET status = 'rejected', approver_id = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    updateStmt.run([approver_id, comment || '', req.params.id]);
    updateStmt.free();
    
    saveDatabase();
    
    res.json({
      success: true,
      message: '审批驳回'
    });
  } catch (error) {
    console.error('审批失败:', error);
    res.status(500).json({
      success: false,
      error: '审批失败'
    });
  }
});

export default router;
