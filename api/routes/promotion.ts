import express from 'express'
import { queryAll, queryOne, execute } from '../db.js'

const router = express.Router()

// ==================== 晋升计划管理 ====================

// 获取所有晋升计划
router.get('/plans', (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    
    let sql = `
      SELECT pp.*, 
             p.name as target_position_name,
             e.name as created_by_name,
             (SELECT COUNT(*) FROM promotion_application WHERE plan_id = pp.id) as application_count
      FROM promotion_plan pp
      LEFT JOIN position p ON pp.target_position_id = p.id
      LEFT JOIN employee e ON pp.created_by = e.id
    `
    
    const params: any[] = []
    if (status) {
      sql += ' WHERE pp.status = ?'
      params.push(status)
    }
    
    sql += ' ORDER BY pp.created_at DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), offset)
    
    const plans = queryAll(sql, params)
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM promotion_plan pp'
    const countParams: any[] = []
    if (status) {
      countSql += ' WHERE pp.status = ?'
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
    console.error('获取晋升计划失败:', error)
    res.status(500).json({ success: false, error: '获取晋升计划失败' })
  }
})

// 获取单个晋升计划详情
router.get('/plans/:id', (req, res) => {
  try {
    const { id } = req.params
    const plan = queryOne(`
      SELECT pp.*, 
             p.name as target_position_name,
             d.name as dept_name,
             e.name as created_by_name
      FROM promotion_plan pp
      LEFT JOIN position p ON pp.target_position_id = p.id
      LEFT JOIN department d ON p.dept_id = d.id
      LEFT JOIN employee e ON pp.created_by = e.id
      WHERE pp.id = ?
    `, [id])
    
    if (!plan) {
      return res.status(404).json({ success: false, error: '晋升计划不存在' })
    }
    
    res.json({ success: true, data: plan })
  } catch (error) {
    console.error('获取晋升计划详情失败:', error)
    res.status(500).json({ success: false, error: '获取晋升计划详情失败' })
  }
})

// 创建晋升计划
router.post('/plans', (req, res) => {
  try {
    const { title, position_name, target_position_id, quota, requirements, start_date, end_date, created_by } = req.body
    
    const id = `plan-${Date.now()}`
    execute(`
      INSERT INTO promotion_plan (id, title, position_name, target_position_id, quota, requirements, start_date, end_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, title, position_name, target_position_id, quota, requirements, start_date, end_date, created_by])
    
    res.json({ success: true, data: { id } })
  } catch (error) {
    console.error('创建晋升计划失败:', error)
    res.status(500).json({ success: false, error: '创建晋升计划失败' })
  }
})

// 更新晋升计划
router.put('/plans/:id', (req, res) => {
  try {
    const { id } = req.params
    const { title, position_name, target_position_id, quota, requirements, start_date, end_date, status } = req.body
    
    execute(`
      UPDATE promotion_plan 
      SET title = ?, position_name = ?, target_position_id = ?, quota = ?, 
          requirements = ?, start_date = ?, end_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, position_name, target_position_id, quota, requirements, start_date, end_date, status, id])
    
    res.json({ success: true })
  } catch (error) {
    console.error('更新晋升计划失败:', error)
    res.status(500).json({ success: false, error: '更新晋升计划失败' })
  }
})

// 删除晋升计划
router.delete('/plans/:id', (req, res) => {
  try {
    const { id } = req.params
    
    // 检查是否有相关申请
    const applicationCount = queryOne('SELECT COUNT(*) as count FROM promotion_application WHERE plan_id = ?', [id])
    if (applicationCount && applicationCount.count > 0) {
      return res.status(400).json({ success: false, error: '该计划已有申请记录，无法删除' })
    }
    
    execute('DELETE FROM promotion_plan WHERE id = ?', [id])
    res.json({ success: true })
  } catch (error) {
    console.error('删除晋升计划失败:', error)
    res.status(500).json({ success: false, error: '删除晋升计划失败' })
  }
})

// ==================== 晋升申请管理 ====================

// 获取晋升申请列表
router.get('/applications', (req, res) => {
  try {
    const { plan_id, employee_id, status, page = 1, limit = 10 } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    
    let sql = `
      SELECT pa.*, 
             e.name as employee_name,
             e.id_number,
             d.name as dept_name,
             cp.name as current_position_name,
             tp.name as target_position_name,
             pp.title as plan_title
      FROM promotion_application pa
      LEFT JOIN employee e ON pa.employee_id = e.id
      LEFT JOIN department d ON e.dept_id = d.id
      LEFT JOIN position cp ON pa.current_position_id = cp.id
      LEFT JOIN position tp ON pa.target_position_id = tp.id
      LEFT JOIN promotion_plan pp ON pa.plan_id = pp.id
      WHERE 1=1
    `
    
    const params: any[] = []
    if (plan_id) {
      sql += ' AND pa.plan_id = ?'
      params.push(plan_id)
    }
    if (employee_id) {
      sql += ' AND pa.employee_id = ?'
      params.push(employee_id)
    }
    if (status) {
      sql += ' AND pa.status = ?'
      params.push(status)
    }
    
    sql += ' ORDER BY pa.submitted_at DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))
    
    const applications = queryAll(sql, params)
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM promotion_application pa WHERE 1=1'
    const countParams: any[] = []
    if (plan_id) {
      countSql += ' AND pa.plan_id = ?'
      countParams.push(plan_id)
    }
    if (employee_id) {
      countSql += ' AND pa.employee_id = ?'
      countParams.push(employee_id)
    }
    if (status) {
      countSql += ' AND pa.status = ?'
      countParams.push(status)
    }
    const countResult = queryOne(countSql, countParams)
    
    res.json({
      success: true,
      data: applications,
      pagination: {
        total: countResult?.total || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((countResult?.total || 0) / Number(limit))
      }
    })
  } catch (error) {
    console.error('获取晋升申请列表失败:', error)
    res.status(500).json({ success: false, error: '获取晋升申请列表失败' })
  }
})

// 获取单个晋升申请详情
router.get('/applications/:id', (req, res) => {
  try {
    const { id } = req.params
    const application = queryOne(`
      SELECT pa.*, 
             e.name as employee_name,
             e.id_number,
             e.entry_date,
             e.phone,
             e.email,
             d.name as dept_name,
             cp.name as current_position_name,
             tp.name as target_position_name,
             pp.title as plan_title,
             pp.requirements as plan_requirements
      FROM promotion_application pa
      LEFT JOIN employee e ON pa.employee_id = e.id
      LEFT JOIN department d ON e.dept_id = d.id
      LEFT JOIN position cp ON pa.current_position_id = cp.id
      LEFT JOIN position tp ON pa.target_position_id = tp.id
      LEFT JOIN promotion_plan pp ON pa.plan_id = pp.id
      WHERE pa.id = ?
    `, [id])
    
    if (!application) {
      return res.status(404).json({ success: false, error: '晋升申请不存在' })
    }
    
    // 获取资格审查信息
    const qualificationReview = queryOne(`
      SELECT pqr.*, e.name as reviewer_name
      FROM promotion_qualification_review pqr
      LEFT JOIN employee e ON pqr.reviewer_id = e.id
      WHERE pqr.application_id = ?
    `, [id])
    
    // 获取民主评议信息
    const democraticReviews = queryAll(`
      SELECT pdr.*, e.name as reviewer_name
      FROM promotion_democratic_review pdr
      LEFT JOIN employee e ON pdr.reviewer_id = e.id
      WHERE pdr.application_id = ?
      ORDER BY pdr.review_date DESC
    `, [id])
    
    // 计算民主评议平均分
    let democraticAvg = null
    if (democraticReviews.length > 0) {
      const totalVirtue = democraticReviews.reduce((sum, r) => sum + (r.virtue_score || 0), 0)
      const totalAbility = democraticReviews.reduce((sum, r) => sum + (r.ability_score || 0), 0)
      const totalDiligence = democraticReviews.reduce((sum, r) => sum + (r.diligence_score || 0), 0)
      const totalPerformance = democraticReviews.reduce((sum, r) => sum + (r.performance_score || 0), 0)
      const totalIntegrity = democraticReviews.reduce((sum, r) => sum + (r.integrity_score || 0), 0)
      const count = democraticReviews.length
      
      democraticAvg = {
        virtue: Math.round(totalVirtue / count),
        ability: Math.round(totalAbility / count),
        diligence: Math.round(totalDiligence / count),
        performance: Math.round(totalPerformance / count),
        integrity: Math.round(totalIntegrity / count),
        total: Math.round((totalVirtue + totalAbility + totalDiligence + totalPerformance + totalIntegrity) / count)
      }
    }
    
    // 获取评审委员会评审信息
    const committeeReviews = queryAll(`
      SELECT pcr.*, e.name as member_name
      FROM promotion_committee_review pcr
      LEFT JOIN employee e ON pcr.member_id = e.id
      WHERE pcr.application_id = ?
      ORDER BY pcr.vote_date DESC
    `, [id])
    
    // 获取公示信息
    const publicity = queryOne(`
      SELECT * FROM promotion_publicity WHERE application_id = ?
    `, [id])
    
    // 获取公示异议
    const objections = publicity ? queryAll(`
      SELECT ppo.*, e.name as handler_name
      FROM promotion_publicity_objection ppo
      LEFT JOIN employee e ON ppo.handler_id = e.id
      WHERE ppo.publicity_id = ?
      ORDER BY ppo.objection_date DESC
    `, [publicity.id]) : []
    
    res.json({
      success: true,
      data: {
        ...application,
        qualification_review: qualificationReview,
        democratic_reviews: democraticReviews,
        democratic_avg: democraticAvg,
        committee_reviews: committeeReviews,
        publicity: publicity,
        objections: objections
      }
    })
  } catch (error) {
    console.error('获取晋升申请详情失败:', error)
    res.status(500).json({ success: false, error: '获取晋升申请详情失败' })
  }
})

// 提交晋升申请
router.post('/applications', (req, res) => {
  try {
    const { plan_id, employee_id, current_position_id, target_position_id, apply_reason, work_summary, achievements } = req.body
    
    // 检查是否已申请
    const existing = queryOne(
      'SELECT id FROM promotion_application WHERE plan_id = ? AND employee_id = ?',
      [plan_id, employee_id]
    )
    if (existing) {
      return res.status(400).json({ success: false, error: '您已提交过该计划的晋升申请' })
    }
    
    const id = `app-${Date.now()}`
    execute(`
      INSERT INTO promotion_application (id, plan_id, employee_id, current_position_id, target_position_id, apply_reason, work_summary, achievements)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, plan_id, employee_id, current_position_id, target_position_id, apply_reason, work_summary, achievements])
    
    res.json({ success: true, data: { id } })
  } catch (error) {
    console.error('提交晋升申请失败:', error)
    res.status(500).json({ success: false, error: '提交晋升申请失败' })
  }
})

// 更新晋升申请状态
router.put('/applications/:id/status', (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    execute(`
      UPDATE promotion_application 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, id])
    
    res.json({ success: true })
  } catch (error) {
    console.error('更新晋升申请状态失败:', error)
    res.status(500).json({ success: false, error: '更新晋升申请状态失败' })
  }
})

// ==================== 资格审查 ====================

// 提交资格审查
router.post('/qualification-review', (req, res) => {
  try {
    const { application_id, reviewer_id, review_date, work_years_check, performance_check, education_check, discipline_check, qualification_score, review_comment, status } = req.body
    
    const id = `qr-${Date.now()}`
    execute(`
      INSERT INTO promotion_qualification_review (id, application_id, reviewer_id, review_date, work_years_check, performance_check, education_check, discipline_check, qualification_score, review_comment, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, application_id, reviewer_id, review_date, work_years_check, performance_check, education_check, discipline_check, qualification_score, review_comment, status])
    
    // 更新申请状态
    const newStatus = status === 'passed' ? 'qualification_passed' : 'qualification_rejected'
    execute(`
      UPDATE promotion_application 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [newStatus, application_id])
    
    res.json({ success: true, data: { id } })
  } catch (error) {
    console.error('提交资格审查失败:', error)
    res.status(500).json({ success: false, error: '提交资格审查失败' })
  }
})

// ==================== 民主评议 ====================

// 提交民主评议
router.post('/democratic-review', (req, res) => {
  try {
    const { application_id, reviewer_id, review_type, virtue_score, ability_score, diligence_score, performance_score, integrity_score, total_score, review_comment, review_date } = req.body
    
    const id = `dr-${Date.now()}`
    execute(`
      INSERT INTO promotion_democratic_review (id, application_id, reviewer_id, review_type, virtue_score, ability_score, diligence_score, performance_score, integrity_score, total_score, review_comment, review_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, application_id, reviewer_id, review_type, virtue_score, ability_score, diligence_score, performance_score, integrity_score, total_score, review_comment, review_date])
    
    res.json({ success: true, data: { id } })
  } catch (error) {
    console.error('提交民主评议失败:', error)
    res.status(500).json({ success: false, error: '提交民主评议失败' })
  }
})

// 更新申请状态为民主评议完成
router.post('/applications/:id/complete-democratic-review', (req, res) => {
  try {
    const { id } = req.params
    
    execute(`
      UPDATE promotion_application 
      SET status = 'democratic_review_completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id])
    
    res.json({ success: true })
  } catch (error) {
    console.error('更新申请状态失败:', error)
    res.status(500).json({ success: false, error: '更新申请状态失败' })
  }
})

// ==================== 评审委员会 ====================

// 获取评审委员会列表
router.get('/committees', (req, res) => {
  try {
    const { plan_id, status } = req.query
    
    let sql = `
      SELECT pc.*, 
             e.name as chairperson_name,
             pp.title as plan_title,
             (SELECT COUNT(*) FROM promotion_committee_member WHERE committee_id = pc.id) as member_count
      FROM promotion_committee pc
      LEFT JOIN employee e ON pc.chairperson_id = e.id
      LEFT JOIN promotion_plan pp ON pc.plan_id = pp.id
      WHERE 1=1
    `
    
    const params: any[] = []
    if (plan_id) {
      sql += ' AND pc.plan_id = ?'
      params.push(plan_id)
    }
    if (status) {
      sql += ' AND pc.status = ?'
      params.push(status)
    }
    
    sql += ' ORDER BY pc.created_at DESC'
    
    const committees = queryAll(sql, params)
    
    res.json({ success: true, data: committees })
  } catch (error) {
    console.error('获取评审委员会列表失败:', error)
    res.status(500).json({ success: false, error: '获取评审委员会列表失败' })
  }
})

// 创建评审委员会
router.post('/committees', (req, res) => {
  try {
    const { name, plan_id, chairperson_id, member_count, meeting_date } = req.body
    
    const id = `comm-${Date.now()}`
    execute(`
      INSERT INTO promotion_committee (id, name, plan_id, chairperson_id, member_count, meeting_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, name, plan_id, chairperson_id, member_count, meeting_date])
    
    res.json({ success: true, data: { id } })
  } catch (error) {
    console.error('创建评审委员会失败:', error)
    res.status(500).json({ success: false, error: '创建评审委员会失败' })
  }
})

// 添加委员会委员
router.post('/committees/:id/members', (req, res) => {
  try {
    const { id } = req.params
    const { employee_id, role = 'member' } = req.body
    
    const memberId = `comm-m-${Date.now()}`
    execute(`
      INSERT INTO promotion_committee_member (id, committee_id, employee_id, role)
      VALUES (?, ?, ?, ?)
    `, [memberId, id, employee_id, role])
    
    // 更新委员数量
    const countResult = queryOne('SELECT COUNT(*) as count FROM promotion_committee_member WHERE committee_id = ?', [id])
    execute('UPDATE promotion_committee SET member_count = ? WHERE id = ?', [countResult?.count || 0, id])
    
    res.json({ success: true, data: { id: memberId } })
  } catch (error) {
    console.error('添加委员会委员失败:', error)
    res.status(500).json({ success: false, error: '添加委员会委员失败' })
  }
})

// 获取委员会委员列表
router.get('/committees/:id/members', (req, res) => {
  try {
    const { id } = req.params
    
    const members = queryAll(`
      SELECT pcm.*, e.name, e.id_number, d.name as dept_name, p.name as position_name
      FROM promotion_committee_member pcm
      LEFT JOIN employee e ON pcm.employee_id = e.id
      LEFT JOIN department d ON e.dept_id = d.id
      LEFT JOIN position p ON e.position_id = p.id
      WHERE pcm.committee_id = ?
      ORDER BY pcm.role DESC, e.name
    `, [id])
    
    res.json({ success: true, data: members })
  } catch (error) {
    console.error('获取委员会委员列表失败:', error)
    res.status(500).json({ success: false, error: '获取委员会委员列表失败' })
  }
})

// 提交委员会评审投票
router.post('/committee-review', (req, res) => {
  try {
    const { committee_id, application_id, member_id, vote_type, vote_comment, vote_date } = req.body
    
    const id = `cr-${Date.now()}`
    execute(`
      INSERT INTO promotion_committee_review (id, committee_id, application_id, member_id, vote_type, vote_comment, vote_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, committee_id, application_id, member_id, vote_type, vote_comment, vote_date])
    
    res.json({ success: true, data: { id } })
  } catch (error) {
    console.error('提交委员会评审投票失败:', error)
    res.status(500).json({ success: false, error: '提交委员会评审投票失败' })
  }
})

// 完成委员会评审
router.post('/committees/:id/complete', (req, res) => {
  try {
    const { id } = req.params
    
    // 获取委员会关联的计划
    const committee = queryOne('SELECT plan_id FROM promotion_committee WHERE id = ?', [id])
    if (!committee) {
      return res.status(404).json({ success: false, error: '评审委员会不存在' })
    }
    
    // 获取该计划下所有通过民主评议的申请
    const applications = queryAll(`
      SELECT id FROM promotion_application 
      WHERE plan_id = ? AND status = 'democratic_review_completed'
    `, [committee.plan_id])
    
    // 统计每个申请的投票结果
    for (const app of applications) {
      const votes = queryAll(`
        SELECT vote_type FROM promotion_committee_review 
        WHERE committee_id = ? AND application_id = ?
      `, [id, app.id])
      
      const approveCount = votes.filter(v => v.vote_type === 'approve').length
      const totalCount = votes.length
      
      // 通过率超过2/3则通过
      const passed = totalCount > 0 && approveCount / totalCount >= 2/3
      
      const newStatus = passed ? 'committee_passed' : 'committee_rejected'
      execute(`
        UPDATE promotion_application 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [newStatus, app.id])
    }
    
    // 更新委员会状态
    execute(`
      UPDATE promotion_committee 
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id])
    
    res.json({ success: true })
  } catch (error) {
    console.error('完成委员会评审失败:', error)
    res.status(500).json({ success: false, error: '完成委员会评审失败' })
  }
})

// ==================== 公示管理 ====================

// 创建公示
router.post('/publicity', (req, res) => {
  try {
    const { application_id, publicity_start_date, publicity_end_date, publicity_channel } = req.body
    
    const id = `pub-${Date.now()}`
    execute(`
      INSERT INTO promotion_publicity (id, application_id, publicity_start_date, publicity_end_date, publicity_channel)
      VALUES (?, ?, ?, ?, ?)
    `, [id, application_id, publicity_start_date, publicity_end_date, publicity_channel])
    
    // 更新申请状态
    execute(`
      UPDATE promotion_application 
      SET status = 'publicizing', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [application_id])
    
    res.json({ success: true, data: { id } })
  } catch (error) {
    console.error('创建公示失败:', error)
    res.status(500).json({ success: false, error: '创建公示失败' })
  }
})

// 获取公示列表
router.get('/publicity', (req, res) => {
  try {
    const { status, application_id } = req.query
    
    let sql = `
      SELECT pp.*, 
             e.name as employee_name,
             d.name as dept_name,
             p.name as target_position_name,
             pa.status as application_status
      FROM promotion_publicity pp
      LEFT JOIN promotion_application pa ON pp.application_id = pa.id
      LEFT JOIN employee e ON pa.employee_id = e.id
      LEFT JOIN department d ON e.dept_id = d.id
      LEFT JOIN position p ON pa.target_position_id = p.id
      WHERE 1=1
    `
    
    const params: any[] = []
    if (status) {
      sql += ' AND pp.status = ?'
      params.push(status)
    }
    if (application_id) {
      sql += ' AND pp.application_id = ?'
      params.push(application_id)
    }
    
    sql += ' ORDER BY pp.publicity_start_date DESC'
    
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
    const { objector_name, objector_contact, objection_content, objection_date } = req.body
    
    const objectionId = `obj-${Date.now()}`
    execute(`
      INSERT INTO promotion_publicity_objection (id, publicity_id, objector_name, objector_contact, objection_content, objection_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [objectionId, id, objector_name, objector_contact, objection_content, objection_date])
    
    // 更新异议数量
    const countResult = queryOne('SELECT COUNT(*) as count FROM promotion_publicity_objection WHERE publicity_id = ?', [id])
    execute('UPDATE promotion_publicity SET objection_count = ? WHERE id = ?', [countResult?.count || 0, id])
    
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
      UPDATE promotion_publicity_objection 
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
    const publicity = queryOne('SELECT application_id, objection_count FROM promotion_publicity WHERE id = ?', [id])
    if (!publicity) {
      return res.status(404).json({ success: false, error: '公示不存在' })
    }
    
    // 检查是否有未处理的异议
    const pendingObjections = queryOne(
      'SELECT COUNT(*) as count FROM promotion_publicity_objection WHERE publicity_id = ? AND handling_status = ?',
      [id, 'pending']
    )
    
    if (pendingObjections && pendingObjections.count > 0) {
      return res.status(400).json({ success: false, error: '还有未处理的异议，无法完成公示' })
    }
    
    // 更新公示状态
    execute(`
      UPDATE promotion_publicity 
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id])
    
    // 更新申请状态
    const newStatus = publicity.objection_count > 0 ? 'publicity_completed_with_objections' : 'publicity_completed'
    execute(`
      UPDATE promotion_application 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [newStatus, publicity.application_id])
    
    res.json({ success: true })
  } catch (error) {
    console.error('完成公示失败:', error)
    res.status(500).json({ success: false, error: '完成公示失败' })
  }
})

// ==================== 晋升记录 ====================

// 创建晋升记录
router.post('/records', (req, res) => {
  try {
    const { application_id, employee_id, from_position_id, to_position_id, promotion_date, probation_period, probation_end_date, approved_by } = req.body
    
    const id = `rec-${Date.now()}`
    execute(`
      INSERT INTO promotion_record (id, application_id, employee_id, from_position_id, to_position_id, promotion_date, probation_period, probation_end_date, approved_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, application_id, employee_id, from_position_id, to_position_id, promotion_date, probation_period, probation_end_date, approved_by])
    
    // 更新申请状态
    execute(`
      UPDATE promotion_application 
      SET status = 'approved', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [application_id])
    
    // 更新员工岗位
    execute(`
      UPDATE employee 
      SET position_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [to_position_id, employee_id])
    
    res.json({ success: true, data: { id } })
  } catch (error) {
    console.error('创建晋升记录失败:', error)
    res.status(500).json({ success: false, error: '创建晋升记录失败' })
  }
})

// 获取晋升记录列表
router.get('/records', (req, res) => {
  try {
    const { employee_id, page = 1, limit = 10 } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    
    let sql = `
      SELECT pr.*, 
             e.name as employee_name,
             d.name as dept_name,
             fp.name as from_position_name,
             tp.name as to_position_name,
             ap.name as approved_by_name
      FROM promotion_record pr
      LEFT JOIN employee e ON pr.employee_id = e.id
      LEFT JOIN department d ON e.dept_id = d.id
      LEFT JOIN position fp ON pr.from_position_id = fp.id
      LEFT JOIN position tp ON pr.to_position_id = tp.id
      LEFT JOIN employee ap ON pr.approved_by = ap.id
      WHERE 1=1
    `
    
    const params: any[] = []
    if (employee_id) {
      sql += ' AND pr.employee_id = ?'
      params.push(employee_id)
    }
    
    sql += ' ORDER BY pr.promotion_date DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))
    
    const records = queryAll(sql, params)
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM promotion_record pr WHERE 1=1'
    const countParams: any[] = []
    if (employee_id) {
      countSql += ' AND pr.employee_id = ?'
      countParams.push(employee_id)
    }
    const countResult = queryOne(countSql, countParams)
    
    res.json({
      success: true,
      data: records,
      pagination: {
        total: countResult?.total || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((countResult?.total || 0) / Number(limit))
      }
    })
  } catch (error) {
    console.error('获取晋升记录列表失败:', error)
    res.status(500).json({ success: false, error: '获取晋升记录列表失败' })
  }
})

// 获取员工晋升历史
router.get('/records/employee/:employeeId', (req, res) => {
  try {
    const { employeeId } = req.params
    
    const records = queryAll(`
      SELECT pr.*, 
             fp.name as from_position_name,
             tp.name as to_position_name,
             ap.name as approved_by_name
      FROM promotion_record pr
      LEFT JOIN position fp ON pr.from_position_id = fp.id
      LEFT JOIN position tp ON pr.to_position_id = tp.id
      LEFT JOIN employee ap ON pr.approved_by = ap.id
      WHERE pr.employee_id = ?
      ORDER BY pr.promotion_date DESC
    `, [employeeId])
    
    res.json({ success: true, data: records })
  } catch (error) {
    console.error('获取员工晋升历史失败:', error)
    res.status(500).json({ success: false, error: '获取员工晋升历史失败' })
  }
})

// ==================== 统计接口 ====================

// 获取晋升统计数据
router.get('/statistics', (req, res) => {
  try {
    // 计划统计
    const planStats = queryOne(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM promotion_plan
    `)
    
    // 申请统计
    const applicationStats = queryOne(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'qualification_passed' THEN 1 ELSE 0 END) as qualification_passed,
        SUM(CASE WHEN status = 'democratic_review_completed' THEN 1 ELSE 0 END) as democratic_completed,
        SUM(CASE WHEN status = 'committee_passed' THEN 1 ELSE 0 END) as committee_passed,
        SUM(CASE WHEN status = 'publicizing' THEN 1 ELSE 0 END) as publicizing,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status IN ('qualification_rejected', 'committee_rejected') THEN 1 ELSE 0 END) as rejected
      FROM promotion_application
    `)
    
    // 本月晋升人数
    const monthlyPromotion = queryOne(`
      SELECT COUNT(*) as count
      FROM promotion_record
      WHERE strftime('%Y-%m', promotion_date) = strftime('%Y-%m', 'now')
    `)
    
    res.json({
      success: true,
      data: {
        plans: planStats,
        applications: applicationStats,
        monthly_promotion: monthlyPromotion?.count || 0
      }
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    res.status(500).json({ success: false, error: '获取统计数据失败' })
  }
})

export default router
