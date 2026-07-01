import express from 'express'
import { queryAll, queryOne, execute } from '../db.js'

const router = express.Router()

// ==================== 干部评审方案管理 ====================

// 获取所有评审方案
router.get('/plans', (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    
    let sql = `
      SELECT crp.*, 
             e.name as created_by_name,
             (SELECT COUNT(*) FROM cadre_review_target WHERE plan_id = crp.id) as target_count
      FROM cadre_review_plan crp
      LEFT JOIN employee e ON crp.created_by = e.id
    `
    
    const params: any[] = []
    if (status) {
      sql += ' WHERE crp.status = ?'
      params.push(status)
    }
    
    sql += ' ORDER BY crp.created_at DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), offset)
    
    const plans = queryAll(sql, params)
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM cadre_review_plan crp'
    const countParams: any[] = []
    if (status) {
      countSql += ' WHERE crp.status = ?'
      countParams.push(status)
    }
    const countResult = queryOne(countSql, countParams)
    
    res.json({
      success: true,
      data: plans,
      pagination: {
        total: countResult?.total || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((countResult?.total || 0) / Number(limit))
      }
    })
  } catch (error) {
    console.error('获取评审方案失败:', error)
    res.status(500).json({ success: false, error: '获取评审方案失败' })
  }
})

// 获取单个评审方案详情
router.get('/plans/:id', (req, res) => {
  try {
    const { id } = req.params
    const plan = queryOne(`
      SELECT crp.*, 
             e.name as created_by_name,
             d.name as dept_name
      FROM cadre_review_plan crp
      LEFT JOIN employee e ON crp.created_by = e.id
      LEFT JOIN department d ON e.dept_id = d.id
      WHERE crp.id = ?
    `, [id])
    
    if (!plan) {
      return res.status(404).json({ success: false, error: '评审方案不存在' })
    }
    
    res.json({ success: true, data: plan })
  } catch (error) {
    console.error('获取评审方案详情失败:', error)
    res.status(500).json({ success: false, error: '获取评审方案详情失败' })
  }
})

// 创建评审方案
router.post('/plans', (req, res) => {
  try {
    const { title, review_period, review_scope, review_dimensions, start_date, end_date, created_by } = req.body
    
    const id = `crp-${Date.now()}`
    execute(`
      INSERT INTO cadre_review_plan (id, title, review_period, review_scope, review_dimensions, start_date, end_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, title, review_period, review_scope, review_dimensions, start_date, end_date, created_by])
    
    res.json({ success: true, data: { id } })
  } catch (error) {
    console.error('创建评审方案失败:', error)
    res.status(500).json({ success: false, error: '创建评审方案失败' })
  }
})

// 更新评审方案
router.put('/plans/:id', (req, res) => {
  try {
    const { id } = req.params
    const { title, review_period, review_scope, review_dimensions, start_date, end_date, status } = req.body
    
    execute(`
      UPDATE cadre_review_plan 
      SET title = ?, review_period = ?, review_scope = ?, review_dimensions = ?, 
          start_date = ?, end_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, review_period, review_scope, review_dimensions, start_date, end_date, status, id])
    
    res.json({ success: true })
  } catch (error) {
    console.error('更新评审方案失败:', error)
    res.status(500).json({ success: false, error: '更新评审方案失败' })
  }
})

// 删除评审方案
router.delete('/plans/:id', (req, res) => {
  try {
    const { id } = req.params
    
    // 检查是否有评审对象
    const targetCount = queryOne('SELECT COUNT(*) as count FROM cadre_review_target WHERE plan_id = ?', [id])
    if (targetCount && targetCount.count > 0) {
      return res.status(400).json({ success: false, error: '该方案已有评审对象，无法删除' })
    }
    
    execute('DELETE FROM cadre_review_plan WHERE id = ?', [id])
    res.json({ success: true })
  } catch (error) {
    console.error('删除评审方案失败:', error)
    res.status(500).json({ success: false, error: '删除评审方案失败' })
  }
})

// ==================== 评审对象管理 ====================

// 获取评审对象列表
router.get('/targets', (req, res) => {
  try {
    const { plan_id, review_status, page = 1, limit = 10 } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    
    let sql = `
      SELECT crt.*, 
             e.name as employee_name,
             e.id_number,
             d.name as dept_name,
             p.name as position_name,
             crp.title as plan_title
      FROM cadre_review_target crt
      LEFT JOIN employee e ON crt.employee_id = e.id
      LEFT JOIN department d ON e.dept_id = d.id
      LEFT JOIN position p ON e.position_id = p.id
      LEFT JOIN cadre_review_plan crp ON crt.plan_id = crp.id
      WHERE 1=1
    `
    
    const params: any[] = []
    if (plan_id) {
      sql += ' AND crt.plan_id = ?'
      params.push(plan_id)
    }
    if (review_status) {
      sql += ' AND crt.review_status = ?'
      params.push(review_status)
    }
    
    sql += ' ORDER BY crt.created_at DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))
    
    const targets = queryAll(sql, params)
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM cadre_review_target crt WHERE 1=1'
    const countParams: any[] = []
    if (plan_id) {
      countSql += ' AND crt.plan_id = ?'
      countParams.push(plan_id)
    }
    if (review_status) {
      countSql += ' AND crt.review_status = ?'
      countParams.push(review_status)
    }
    const countResult = queryOne(countSql, countParams)
    
    res.json({
      success: true,
      data: targets,
      pagination: {
        total: countResult?.total || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((countResult?.total || 0) / Number(limit))
      }
    })
  } catch (error) {
    console.error('获取评审对象列表失败:', error)
    res.status(500).json({ success: false, error: '获取评审对象列表失败' })
  }
})

// 添加评审对象
router.post('/targets', (req, res) => {
  try {
    const { plan_id, employee_id, current_position } = req.body
    
    // 检查是否已添加
    const existing = queryOne(
      'SELECT id FROM cadre_review_target WHERE plan_id = ? AND employee_id = ?',
      [plan_id, employee_id]
    )
    if (existing) {
      return res.status(400).json({ success: false, error: '该员工已在评审对象列表中' })
    }
    
    const id = `crt-${Date.now()}`
    execute(`
      INSERT INTO cadre_review_target (id, plan_id, employee_id, current_position)
      VALUES (?, ?, ?, ?)
    `, [id, plan_id, employee_id, current_position])
    
    res.json({ success: true, data: { id } })
  } catch (error) {
    console.error('添加评审对象失败:', error)
    res.status(500).json({ success: false, error: '添加评审对象失败' })
  }
})

// 删除评审对象
router.delete('/targets/:id', (req, res) => {
  try {
    const { id } = req.params
    
    // 删除相关的评审记录
    execute('DELETE FROM cadre_self_evaluation WHERE target_id = ?', [id])
    execute('DELETE FROM cadre_democratic_evaluation WHERE target_id = ?', [id])
    execute('DELETE FROM cadre_organizational_evaluation WHERE target_id = ?', [id])
    execute('DELETE FROM cadre_comprehensive_evaluation WHERE target_id = ?', [id])
    execute('DELETE FROM cadre_review_target WHERE id = ?', [id])
    
    res.json({ success: true })
  } catch (error) {
    console.error('删除评审对象失败:', error)
    res.status(500).json({ success: false, error: '删除评审对象失败' })
  }
})

// 获取评审对象详情
router.get('/targets/:id', (req, res) => {
  try {
    const { id } = req.params
    
    const target = queryOne(`
      SELECT crt.*, 
             e.name as employee_name,
             e.id_number,
             e.entry_date,
             e.phone,
             e.email,
             d.name as dept_name,
             p.name as position_name,
             crp.title as plan_title,
             crp.review_dimensions
      FROM cadre_review_target crt
      LEFT JOIN employee e ON crt.employee_id = e.id
      LEFT JOIN department d ON e.dept_id = d.id
      LEFT JOIN position p ON e.position_id = p.id
      LEFT JOIN cadre_review_plan crp ON crt.plan_id = crp.id
      WHERE crt.id = ?
    `, [id])
    
    if (!target) {
      return res.status(404).json({ success: false, error: '评审对象不存在' })
    }
    
    // 获取自我评价
    const selfEvaluation = queryOne(`
      SELECT * FROM cadre_self_evaluation WHERE target_id = ?
    `, [id])
    
    // 获取民主测评
    const democraticEvaluations = queryAll(`
      SELECT cde.*, e.name as evaluator_name
      FROM cadre_democratic_evaluation cde
      LEFT JOIN employee e ON cde.evaluator_id = e.id
      WHERE cde.target_id = ?
      ORDER BY cde.evaluation_date DESC
    `, [id])
    
    // 计算民主测评平均分
    let democraticAvg = null
    if (democraticEvaluations.length > 0) {
      const totalVirtue = democraticEvaluations.reduce((sum, r) => sum + (r.virtue_score || 0), 0)
      const totalAbility = democraticEvaluations.reduce((sum, r) => sum + (r.ability_score || 0), 0)
      const totalDiligence = democraticEvaluations.reduce((sum, r) => sum + (r.diligence_score || 0), 0)
      const totalPerformance = democraticEvaluations.reduce((sum, r) => sum + (r.performance_score || 0), 0)
      const totalIntegrity = democraticEvaluations.reduce((sum, r) => sum + (r.integrity_score || 0), 0)
      const count = democraticEvaluations.length
      
      democraticAvg = {
        virtue: Math.round(totalVirtue / count),
        ability: Math.round(totalAbility / count),
        diligence: Math.round(totalDiligence / count),
        performance: Math.round(totalPerformance / count),
        integrity: Math.round(totalIntegrity / count),
        total: Math.round((totalVirtue + totalAbility + totalDiligence + totalPerformance + totalIntegrity) / count)
      }
    }
    
    // 获取组织考察
    const organizationalEvaluations = queryAll(`
      SELECT coe.*, e.name as investigator_name
      FROM cadre_organizational_evaluation coe
      LEFT JOIN employee e ON coe.investigator_id = e.id
      WHERE coe.target_id = ?
      ORDER BY coe.investigation_date DESC
    `, [id])
    
    // 获取综合评价
    const comprehensiveEvaluation = queryOne(`
      SELECT cce.*, e.name as evaluator_name
      FROM cadre_comprehensive_evaluation cce
      LEFT JOIN employee e ON cce.evaluator_id = e.id
      WHERE cce.target_id = ?
    `, [id])
    
    res.json({
      success: true,
      data: {
        ...target,
        self_evaluation: selfEvaluation,
        democratic_evaluations: democraticEvaluations,
        democratic_avg: democraticAvg,
        organizational_evalations: organizationalEvaluations,
        comprehensive_evaluation: comprehensiveEvaluation
      }
    })
  } catch (error) {
    console.error('获取评审对象详情失败:', error)
    res.status(500).json({ success: false, error: '获取评审对象详情失败' })
  }
})

// ==================== 自我评价 ====================

// 提交自我评价
router.post('/self-evaluation', (req, res) => {
  try {
    const { target_id, virtue_summary, ability_summary, diligence_summary, performance_summary, integrity_summary, achievements, shortcomings, improvement_plan } = req.body
    
    // 检查是否已提交
    const existing = queryOne('SELECT id FROM cadre_self_evaluation WHERE target_id = ?', [target_id])
    if (existing) {
      return res.status(400).json({ success: false, error: '已提交自我评价' })
    }
    
    const id = `cse-${Date.now()}`
    execute(`
      INSERT INTO cadre_self_evaluation (id, target_id, virtue_summary, ability_summary, diligence_summary, performance_summary, integrity_summary, achievements, shortcomings, improvement_plan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, target_id, virtue_summary, ability_summary, diligence_summary, performance_summary, integrity_summary, achievements, shortcomings, improvement_plan])
    
    // 更新评审对象状态
    execute(`
      UPDATE cadre_review_target 
      SET review_status = 'self_evaluated', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [target_id])
    
    res.json({ success: true, data: { id } })
  } catch (error) {
    console.error('提交自我评价失败:', error)
    res.status(500).json({ success: false, error: '提交自我评价失败' })
  }
})

// ==================== 民主测评 ====================

// 提交民主测评
router.post('/democratic-evaluation', (req, res) => {
  try {
    const { target_id, evaluator_id, evaluation_type, virtue_score, ability_score, diligence_score, performance_score, integrity_score, total_score, evaluation_comment, evaluation_date } = req.body
    
    const id = `cde-${Date.now()}`
    execute(`
      INSERT INTO cadre_democratic_evaluation (id, target_id, evaluator_id, evaluation_type, virtue_score, ability_score, diligence_score, performance_score, integrity_score, total_score, evaluation_comment, evaluation_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, target_id, evaluator_id, evaluation_type, virtue_score, ability_score, diligence_score, performance_score, integrity_score, total_score, evaluation_comment, evaluation_date])
    
    // 更新评审对象的民主测评分数
    const avgResult = queryOne(`
      SELECT AVG(total_score) as avg_score FROM cadre_democratic_evaluation WHERE target_id = ?
    `, [target_id])
    
    if (avgResult && avgResult.avg_score) {
      execute(`
        UPDATE cadre_review_target 
        SET democratic_score = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [Math.round(avgResult.avg_score), target_id])
    }
    
    res.json({ success: true, data: { id } })
  } catch (error) {
    console.error('提交民主测评失败:', error)
    res.status(500).json({ success: false, error: '提交民主测评失败' })
  }
})

// 完成民主测评
router.post('/targets/:id/complete-democratic', (req, res) => {
  try {
    const { id } = req.params
    
    execute(`
      UPDATE cadre_review_target 
      SET review_status = 'democratic_completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id])
    
    res.json({ success: true })
  } catch (error) {
    console.error('完成民主测评失败:', error)
    res.status(500).json({ success: false, error: '完成民主测评失败' })
  }
})

// ==================== 组织考察 ====================

// 提交组织考察
router.post('/organizational-evaluation', (req, res) => {
  try {
    const { target_id, investigator_id, investigation_date, virtue_performance, ability_performance, diligence_performance, performance_performance, integrity_performance, major_achievements, existing_problems, investigation_score, investigation_comment } = req.body
    
    const id = `coe-${Date.now()}`
    execute(`
      INSERT INTO cadre_organizational_evaluation (id, target_id, investigator_id, investigation_date, virtue_performance, ability_performance, diligence_performance, performance_performance, integrity_performance, major_achievements, existing_problems, investigation_score, investigation_comment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, target_id, investigator_id, investigation_date, virtue_performance, ability_performance, diligence_performance, performance_performance, integrity_performance, major_achievements, existing_problems, investigation_score, investigation_comment])
    
    // 更新评审对象的组织考察分数
    execute(`
      UPDATE cadre_review_target 
      SET organizational_score = ?, review_status = 'organizational_completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [investigation_score, target_id])
    
    res.json({ success: true, data: { id } })
  } catch (error) {
    console.error('提交组织考察失败:', error)
    res.status(500).json({ success: false, error: '提交组织考察失败' })
  }
})

// ==================== 综合评价 ====================

// 提交综合评价
router.post('/comprehensive-evaluation', (req, res) => {
  try {
    const { target_id, evaluator_id, evaluation_date, self_eval_weight, democratic_eval_weight, organizational_eval_weight, final_score, final_rating, evaluation_conclusion, recommendation } = req.body
    
    // 检查是否已提交
    const existing = queryOne('SELECT id FROM cadre_comprehensive_evaluation WHERE target_id = ?', [target_id])
    if (existing) {
      return res.status(400).json({ success: false, error: '已提交综合评价' })
    }
    
    const id = `cce-${Date.now()}`
    execute(`
      INSERT INTO cadre_comprehensive_evaluation (id, target_id, evaluator_id, evaluation_date, self_eval_weight, democratic_eval_weight, organizational_eval_weight, final_score, final_rating, evaluation_conclusion, recommendation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, target_id, evaluator_id, evaluation_date, self_eval_weight, democratic_eval_weight, organizational_eval_weight, final_score, final_rating, evaluation_conclusion, recommendation])
    
    // 更新评审对象的综合分数和评级
    execute(`
      UPDATE cadre_review_target 
      SET comprehensive_score = ?, final_rating = ?, review_status = 'comprehensive_completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [final_score, final_rating, target_id])
    
    res.json({ success: true, data: { id } })
  } catch (error) {
    console.error('提交综合评价失败:', error)
    res.status(500).json({ success: false, error: '提交综合评价失败' })
  }
})

// ==================== 公示管理 ====================

// 创建公示
router.post('/publicity', (req, res) => {
  try {
    const { plan_id, publicity_start_date, publicity_end_date, publicity_channel } = req.body
    
    const id = `crpub-${Date.now()}`
    execute(`
      INSERT INTO cadre_review_publicity (id, plan_id, publicity_start_date, publicity_end_date, publicity_channel)
      VALUES (?, ?, ?, ?, ?)
    `, [id, plan_id, publicity_start_date, publicity_end_date, publicity_channel])
    
    // 更新方案状态
    execute(`
      UPDATE cadre_review_plan 
      SET status = 'publicizing', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [plan_id])
    
    res.json({ success: true, data: { id } })
  } catch (error) {
    console.error('创建公示失败:', error)
    res.status(500).json({ success: false, error: '创建公示失败' })
  }
})

// 获取公示列表
router.get('/publicity', (req, res) => {
  try {
    const { status, plan_id } = req.query
    
    let sql = `
      SELECT crp.*, 
             crp2.title as plan_title,
             (SELECT COUNT(*) FROM cadre_review_publicity_objection WHERE publicity_id = crp.id) as objection_count
      FROM cadre_review_publicity crp
      LEFT JOIN cadre_review_plan crp2 ON crp.plan_id = crp2.id
      WHERE 1=1
    `
    
    const params: any[] = []
    if (status) {
      sql += ' AND crp.status = ?'
      params.push(status)
    }
    if (plan_id) {
      sql += ' AND crp.plan_id = ?'
      params.push(plan_id)
    }
    
    sql += ' ORDER BY crp.publicity_start_date DESC'
    
    const publicityList = queryAll(sql, params)
    
    res.json({ success: true, data: publicityList })
  } catch (error) {
    console.error('获取公示列表失败:', error)
    res.status(500).json({ success: false, error: '获取公示列表失败' })
  }
})

// 提交公示异议
router.post('/publicity/:id/objections', (req, res) => {
  try {
    const { id } = req.params
    const { target_id, objector_name, objector_contact, objection_content, objection_date } = req.body
    
    const objectionId = `cro-${Date.now()}`
    execute(`
      INSERT INTO cadre_review_publicity_objection (id, publicity_id, target_id, objector_name, objector_contact, objection_content, objection_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [objectionId, id, target_id, objector_name, objector_contact, objection_content, objection_date])
    
    // 更新异议数量
    const countResult = queryOne('SELECT COUNT(*) as count FROM cadre_review_publicity_objection WHERE publicity_id = ?', [id])
    execute('UPDATE cadre_review_publicity SET objection_count = ? WHERE id = ?', [countResult?.count || 0, id])
    
    res.json({ success: true, data: { id: objectionId } })
  } catch (error) {
    console.error('提交公示异议失败:', error)
    res.status(500).json({ success: false, error: '提交公示异议失败' })
  }
})

// 处理公示异议
router.put('/objections/:id', (req, res) => {
  try {
    const { id } = req.params
    const { investigation_result, handling_status, handler_id, handle_date } = req.body
    
    execute(`
      UPDATE cadre_review_publicity_objection 
      SET investigation_result = ?, handling_status = ?, handler_id = ?, handle_date = ?
      WHERE id = ?
    `, [investigation_result, handling_status, handler_id, handle_date, id])
    
    res.json({ success: true })
  } catch (error) {
    console.error('处理公示异议失败:', error)
    res.status(500).json({ success: false, error: '处理公示异议失败' })
  }
})

// 完成公示
router.post('/publicity/:id/complete', (req, res) => {
  try {
    const { id } = req.params
    
    // 获取公示信息
    const publicity = queryOne('SELECT plan_id, objection_count FROM cadre_review_publicity WHERE id = ?', [id])
    if (!publicity) {
      return res.status(404).json({ success: false, error: '公示不存在' })
    }
    
    // 检查是否有未处理的异议
    const pendingObjections = queryOne(
      'SELECT COUNT(*) as count FROM cadre_review_publicity_objection WHERE publicity_id = ? AND handling_status = ?',
      [id, 'pending']
    )
    
    if (pendingObjections && pendingObjections.count > 0) {
      return res.status(400).json({ success: false, error: '还有未处理的异议，无法完成公示' })
    }
    
    // 更新公示状态
    execute(`
      UPDATE cadre_review_publicity 
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id])
    
    // 更新方案状态
    execute(`
      UPDATE cadre_review_plan 
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [publicity.plan_id])
    
    // 更新所有评审对象状态为已完成
    execute(`
      UPDATE cadre_review_target 
      SET review_status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE plan_id = ?
    `, [publicity.plan_id])
    
    res.json({ success: true })
  } catch (error) {
    console.error('完成公示失败:', error)
    res.status(500).json({ success: false, error: '完成公示失败' })
  }
})

// ==================== 统计接口 ====================

// 获取干部评审统计数据
router.get('/statistics', (req, res) => {
  try {
    // 方案统计
    const planStats = queryOne(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'publicizing' THEN 1 ELSE 0 END) as publicizing,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM cadre_review_plan
    `)
    
    // 评审对象统计
    const targetStats = queryOne(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN review_status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN review_status = 'self_evaluated' THEN 1 ELSE 0 END) as self_evaluated,
        SUM(CASE WHEN review_status = 'democratic_completed' THEN 1 ELSE 0 END) as democratic_completed,
        SUM(CASE WHEN review_status = 'organizational_completed' THEN 1 ELSE 0 END) as organizational_completed,
        SUM(CASE WHEN review_status = 'comprehensive_completed' THEN 1 ELSE 0 END) as comprehensive_completed,
        SUM(CASE WHEN review_status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM cadre_review_target
    `)
    
    // 评级分布
    const ratingStats = queryAll(`
      SELECT 
        final_rating,
        COUNT(*) as count
      FROM cadre_review_target
      WHERE final_rating IS NOT NULL
      GROUP BY final_rating
    `)
    
    res.json({
      success: true,
      data: {
        plans: planStats,
        targets: targetStats,
        ratings: ratingStats
      }
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    res.status(500).json({ success: false, error: '获取统计数据失败' })
  }
})

export default router
