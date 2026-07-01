import initSqlJs, { Database } from 'sql.js'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 数据库文件路径
const dbPath = path.join(__dirname, '../hr-platform.db')

let db: Database | null = null

// 初始化数据库
export async function initDatabase(): Promise<Database> {
  const SQL = await initSqlJs()
  
  // 如果数据库文件存在，则加载
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  // 组织表
  db.run(`
    CREATE TABLE IF NOT EXISTS organization (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 部门表
  db.run(`
    CREATE TABLE IF NOT EXISTS department (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      name TEXT NOT NULL,
      parent_id TEXT,
      leader_id TEXT,
      headcount_quota INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (org_id) REFERENCES organization(id),
      FOREIGN KEY (parent_id) REFERENCES department(id)
    )
  `)

  // 岗位表
  db.run(`
    CREATE TABLE IF NOT EXISTS position (
      id TEXT PRIMARY KEY,
      dept_id TEXT NOT NULL,
      name TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      quota INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dept_id) REFERENCES department(id)
    )
  `)

  // 员工表
  db.run(`
    CREATE TABLE IF NOT EXISTS employee (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      id_number TEXT UNIQUE NOT NULL,
      dept_id TEXT NOT NULL,
      position_id TEXT,
      status TEXT DEFAULT 'active',
      entry_date DATE,
      birth_date DATE,
      phone TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dept_id) REFERENCES department(id),
      FOREIGN KEY (position_id) REFERENCES position(id)
    )
  `)

  // 合同表
  db.run(`
    CREATE TABLE IF NOT EXISTS contract (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      contract_no TEXT UNIQUE NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employee(id)
    )
  `)

  // 招聘需求表
  db.run(`
    CREATE TABLE IF NOT EXISTS recruitment_demand (
      id TEXT PRIMARY KEY,
      dept_id TEXT NOT NULL,
      position_name TEXT NOT NULL,
      headcount INTEGER NOT NULL,
      requirements TEXT,
      status TEXT DEFAULT 'pending',
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dept_id) REFERENCES department(id)
    )
  `)

  // 简历表
  db.run(`
    CREATE TABLE IF NOT EXISTS resume (
      id TEXT PRIMARY KEY,
      demand_id TEXT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      education TEXT,
      experience_years INTEGER,
      status TEXT DEFAULT 'screening',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (demand_id) REFERENCES recruitment_demand(id)
    )
  `)

  // 面试表
  db.run(`
    CREATE TABLE IF NOT EXISTS interview (
      id TEXT PRIMARY KEY,
      resume_id TEXT NOT NULL,
      interview_date DATETIME NOT NULL,
      interview_type TEXT NOT NULL,
      interviewer_id TEXT,
      score INTEGER,
      comment TEXT,
      status TEXT DEFAULT 'scheduled',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (resume_id) REFERENCES resume(id),
      FOREIGN KEY (interviewer_id) REFERENCES employee(id)
    )
  `)

  // 晋升计划表
  db.run(`
    CREATE TABLE IF NOT EXISTS promotion_plan (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      position_name TEXT NOT NULL,
      target_position_id TEXT,
      quota INTEGER NOT NULL DEFAULT 1,
      requirements TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT DEFAULT 'draft',
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (target_position_id) REFERENCES position(id),
      FOREIGN KEY (created_by) REFERENCES employee(id)
    )
  `)

  // 晋升申请表
  db.run(`
    CREATE TABLE IF NOT EXISTS promotion_application (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      current_position_id TEXT NOT NULL,
      target_position_id TEXT NOT NULL,
      apply_reason TEXT,
      work_summary TEXT,
      achievements TEXT,
      status TEXT DEFAULT 'submitted',
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES promotion_plan(id),
      FOREIGN KEY (employee_id) REFERENCES employee(id),
      FOREIGN KEY (current_position_id) REFERENCES position(id),
      FOREIGN KEY (target_position_id) REFERENCES position(id)
    )
  `)

  // 资格审查表
  db.run(`
    CREATE TABLE IF NOT EXISTS promotion_qualification_review (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      reviewer_id TEXT NOT NULL,
      review_date DATE NOT NULL,
      work_years_check INTEGER DEFAULT 0,
      performance_check INTEGER DEFAULT 0,
      education_check INTEGER DEFAULT 0,
      discipline_check INTEGER DEFAULT 0,
      qualification_score INTEGER,
      review_comment TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES promotion_application(id),
      FOREIGN KEY (reviewer_id) REFERENCES employee(id)
    )
  `)

  // 民主评议表
  db.run(`
    CREATE TABLE IF NOT EXISTS promotion_democratic_review (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      reviewer_id TEXT NOT NULL,
      review_type TEXT NOT NULL,
      virtue_score INTEGER,
      ability_score INTEGER,
      diligence_score INTEGER,
      performance_score INTEGER,
      integrity_score INTEGER,
      total_score INTEGER,
      review_comment TEXT,
      review_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES promotion_application(id),
      FOREIGN KEY (reviewer_id) REFERENCES employee(id)
    )
  `)

  // 评审委员会表
  db.run(`
    CREATE TABLE IF NOT EXISTS promotion_committee (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      plan_id TEXT,
      chairperson_id TEXT,
      member_count INTEGER DEFAULT 0,
      meeting_date DATE,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES promotion_plan(id),
      FOREIGN KEY (chairperson_id) REFERENCES employee(id)
    )
  `)

  // 评审委员会委员表
  db.run(`
    CREATE TABLE IF NOT EXISTS promotion_committee_member (
      id TEXT PRIMARY KEY,
      committee_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (committee_id) REFERENCES promotion_committee(id),
      FOREIGN KEY (employee_id) REFERENCES employee(id)
    )
  `)

  // 评审委员会评审记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS promotion_committee_review (
      id TEXT PRIMARY KEY,
      committee_id TEXT NOT NULL,
      application_id TEXT NOT NULL,
      member_id TEXT NOT NULL,
      vote_type TEXT NOT NULL,
      vote_comment TEXT,
      vote_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (committee_id) REFERENCES promotion_committee(id),
      FOREIGN KEY (application_id) REFERENCES promotion_application(id),
      FOREIGN KEY (member_id) REFERENCES employee(id)
    )
  `)

  // 晋升公示表
  db.run(`
    CREATE TABLE IF NOT EXISTS promotion_publicity (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      publicity_start_date DATE NOT NULL,
      publicity_end_date DATE NOT NULL,
      publicity_channel TEXT,
      status TEXT DEFAULT 'pending',
      objection_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES promotion_application(id)
    )
  `)

  // 晋升公示异议表
  db.run(`
    CREATE TABLE IF NOT EXISTS promotion_publicity_objection (
      id TEXT PRIMARY KEY,
      publicity_id TEXT NOT NULL,
      objector_name TEXT NOT NULL,
      objector_contact TEXT,
      objection_content TEXT NOT NULL,
      objection_date DATE NOT NULL,
      investigation_result TEXT,
      handling_status TEXT DEFAULT 'pending',
      handler_id TEXT,
      handle_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (publicity_id) REFERENCES promotion_publicity(id),
      FOREIGN KEY (handler_id) REFERENCES employee(id)
    )
  `)

  // 晋升记录表（增强版）
  db.run(`
    CREATE TABLE IF NOT EXISTS promotion_record (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      from_position_id TEXT,
      to_position_id TEXT,
      promotion_date DATE,
      probation_period INTEGER DEFAULT 0,
      probation_end_date DATE,
      status TEXT DEFAULT 'pending',
      approved_by TEXT,
      approved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES promotion_application(id),
      FOREIGN KEY (employee_id) REFERENCES employee(id),
      FOREIGN KEY (approved_by) REFERENCES employee(id)
    )
  `)

  // 干部评审表
  db.run(`
    CREATE TABLE IF NOT EXISTS cadre_review (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      review_period TEXT NOT NULL,
      review_dimension TEXT NOT NULL,
      score INTEGER,
      comment TEXT,
      reviewer_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employee(id),
      FOREIGN KEY (reviewer_id) REFERENCES employee(id)
    )
  `)

  // 干部评审方案表
  db.run(`
    CREATE TABLE IF NOT EXISTS cadre_review_plan (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      review_period TEXT NOT NULL,
      review_scope TEXT NOT NULL,
      review_dimensions TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT DEFAULT 'draft',
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES employee(id)
    )
  `)

  // 干部评审对象表
  db.run(`
    CREATE TABLE IF NOT EXISTS cadre_review_target (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      current_position TEXT,
      review_status TEXT DEFAULT 'pending',
      self_evaluation_score INTEGER,
      democratic_score INTEGER,
      organizational_score INTEGER,
      comprehensive_score INTEGER,
      final_rating TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES cadre_review_plan(id),
      FOREIGN KEY (employee_id) REFERENCES employee(id)
    )
  `)

  // 干部自我评价表
  db.run(`
    CREATE TABLE IF NOT EXISTS cadre_self_evaluation (
      id TEXT PRIMARY KEY,
      target_id TEXT NOT NULL,
      virtue_summary TEXT,
      ability_summary TEXT,
      diligence_summary TEXT,
      performance_summary TEXT,
      integrity_summary TEXT,
      achievements TEXT,
      shortcomings TEXT,
      improvement_plan TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (target_id) REFERENCES cadre_review_target(id)
    )
  `)

  // 干部民主测评表
  db.run(`
    CREATE TABLE IF NOT EXISTS cadre_democratic_evaluation (
      id TEXT PRIMARY KEY,
      target_id TEXT NOT NULL,
      evaluator_id TEXT NOT NULL,
      evaluation_type TEXT NOT NULL,
      virtue_score INTEGER,
      ability_score INTEGER,
      diligence_score INTEGER,
      performance_score INTEGER,
      integrity_score INTEGER,
      total_score INTEGER,
      evaluation_comment TEXT,
      evaluation_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (target_id) REFERENCES cadre_review_target(id),
      FOREIGN KEY (evaluator_id) REFERENCES employee(id)
    )
  `)

  // 干部组织考察表
  db.run(`
    CREATE TABLE IF NOT EXISTS cadre_organizational_evaluation (
      id TEXT PRIMARY KEY,
      target_id TEXT NOT NULL,
      investigator_id TEXT NOT NULL,
      investigation_date DATE NOT NULL,
      virtue_performance TEXT,
      ability_performance TEXT,
      diligence_performance TEXT,
      performance_performance TEXT,
      integrity_performance TEXT,
      major_achievements TEXT,
      existing_problems TEXT,
      investigation_score INTEGER,
      investigation_comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (target_id) REFERENCES cadre_review_target(id),
      FOREIGN KEY (investigator_id) REFERENCES employee(id)
    )
  `)

  // 干部综合评价表
  db.run(`
    CREATE TABLE IF NOT EXISTS cadre_comprehensive_evaluation (
      id TEXT PRIMARY KEY,
      target_id TEXT NOT NULL,
      evaluator_id TEXT NOT NULL,
      evaluation_date DATE NOT NULL,
      self_eval_weight INTEGER DEFAULT 10,
      democratic_eval_weight INTEGER DEFAULT 40,
      organizational_eval_weight INTEGER DEFAULT 50,
      final_score INTEGER,
      final_rating TEXT,
      evaluation_conclusion TEXT,
      recommendation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (target_id) REFERENCES cadre_review_target(id),
      FOREIGN KEY (evaluator_id) REFERENCES employee(id)
    )
  `)

  // 干部评审公示表
  db.run(`
    CREATE TABLE IF NOT EXISTS cadre_review_publicity (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      publicity_start_date DATE NOT NULL,
      publicity_end_date DATE NOT NULL,
      publicity_channel TEXT,
      status TEXT DEFAULT 'pending',
      objection_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES cadre_review_plan(id)
    )
  `)

  // 干部评审公示异议表
  db.run(`
    CREATE TABLE IF NOT EXISTS cadre_review_publicity_objection (
      id TEXT PRIMARY KEY,
      publicity_id TEXT NOT NULL,
      target_id TEXT,
      objector_name TEXT NOT NULL,
      objector_contact TEXT,
      objection_content TEXT NOT NULL,
      objection_date DATE NOT NULL,
      investigation_result TEXT,
      handling_status TEXT DEFAULT 'pending',
      handler_id TEXT,
      handle_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (publicity_id) REFERENCES cadre_review_publicity(id),
      FOREIGN KEY (target_id) REFERENCES cadre_review_target(id),
      FOREIGN KEY (handler_id) REFERENCES employee(id)
    )
  `)

  // 绩效考核表
  db.run(`
    CREATE TABLE IF NOT EXISTS performance (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      period TEXT NOT NULL,
      goal TEXT,
      score INTEGER,
      level TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employee(id)
    )
  `)

  // 考勤记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      date DATE NOT NULL,
      check_in DATETIME,
      check_out DATETIME,
      status TEXT DEFAULT 'normal',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employee(id)
    )
  `)

  // 请假记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS leave_record (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      leave_type TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      days INTEGER NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employee(id)
    )
  `)

  // 离职记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS resign_record (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      resign_date DATE NOT NULL,
      resign_type TEXT NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employee(id)
    )
  `)

  // 退休记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS retire_record (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      retire_date DATE NOT NULL,
      retire_type TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employee(id)
    )
  `)

  // 审批任务表
  db.run(`
    CREATE TABLE IF NOT EXISTS approval_task (
      id TEXT PRIMARY KEY,
      business_type TEXT NOT NULL,
      business_id TEXT NOT NULL,
      title TEXT NOT NULL,
      applicant_id TEXT NOT NULL,
      approver_id TEXT,
      status TEXT DEFAULT 'pending',
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (applicant_id) REFERENCES employee(id),
      FOREIGN KEY (approver_id) REFERENCES employee(id)
    )
  `)

  // 用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      employee_id TEXT,
      role TEXT DEFAULT 'employee',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employee(id)
    )
  `)

  // 创建索引
  db.run(`CREATE INDEX IF NOT EXISTS idx_employee_dept ON employee(dept_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_employee_status ON employee(status)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_approval_applicant ON approval_task(applicant_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_approval_approver ON approval_task(approver_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_approval_status ON approval_task(status)`)
  
  // 晋升工作流索引
  db.run(`CREATE INDEX IF NOT EXISTS idx_promotion_plan_status ON promotion_plan(status)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_promotion_plan_date ON promotion_plan(start_date, end_date)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_promotion_application_plan ON promotion_application(plan_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_promotion_application_employee ON promotion_application(employee_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_promotion_application_status ON promotion_application(status)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_promotion_qual_review ON promotion_qualification_review(application_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_promotion_democratic_review ON promotion_democratic_review(application_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_promotion_committee_plan ON promotion_committee(plan_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_promotion_committee_member ON promotion_committee_member(committee_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_promotion_committee_review ON promotion_committee_review(application_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_promotion_publicity_application ON promotion_publicity(application_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_promotion_publicity_status ON promotion_publicity(status)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_promotion_objection_publicity ON promotion_publicity_objection(publicity_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_promotion_record_application ON promotion_record(application_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_promotion_record_employee ON promotion_record(employee_id)`)

  // 插入初始数据
  const orgCount = db.exec('SELECT COUNT(*) as count FROM organization')[0]
  if (orgCount && orgCount.values[0][0] === 0) {
    // 插入示例组织
    db.run(`INSERT INTO organization (id, name, type, level) VALUES (?, ?, ?, ?)`, ['org-001', '示例公司', 'enterprise', 1])

    // 插入示例部门
    db.run(`INSERT INTO department (id, org_id, name, parent_id, leader_id, headcount_quota) VALUES (?, ?, ?, ?, ?, ?)`, ['dept-001', 'org-001', '人事部', null, null, 20])
    db.run(`INSERT INTO department (id, org_id, name, parent_id, leader_id, headcount_quota) VALUES (?, ?, ?, ?, ?, ?)`, ['dept-002', 'org-001', '技术部', null, null, 50])
    db.run(`INSERT INTO department (id, org_id, name, parent_id, leader_id, headcount_quota) VALUES (?, ?, ?, ?, ?, ?)`, ['dept-003', 'org-001', '市场部', null, null, 30])

    // 插入示例岗位
    db.run(`INSERT INTO position (id, dept_id, name, level, quota) VALUES (?, ?, ?, ?, ?)`, ['pos-001', 'dept-001', '人事经理', 5, 1])
    db.run(`INSERT INTO position (id, dept_id, name, level, quota) VALUES (?, ?, ?, ?, ?)`, ['pos-002', 'dept-001', '人事专员', 3, 5])
    db.run(`INSERT INTO position (id, dept_id, name, level, quota) VALUES (?, ?, ?, ?, ?)`, ['pos-003', 'dept-002', '技术总监', 7, 1])
    db.run(`INSERT INTO position (id, dept_id, name, level, quota) VALUES (?, ?, ?, ?, ?)`, ['pos-004', 'dept-002', '高级工程师', 5, 10])
    db.run(`INSERT INTO position (id, dept_id, name, level, quota) VALUES (?, ?, ?, ?, ?)`, ['pos-005', 'dept-003', '市场经理', 5, 1])

    // 插入示例员工
    db.run(`INSERT INTO employee (id, name, id_number, dept_id, position_id, status, entry_date, birth_date, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['emp-001', '张三', '110101199001011234', 'dept-001', 'pos-001', 'active', '2020-01-01', '1990-01-01', '13800138000', 'zhangsan@example.com'])
    db.run(`INSERT INTO employee (id, name, id_number, dept_id, position_id, status, entry_date, birth_date, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['emp-002', '李四', '110101199201011234', 'dept-002', 'pos-003', 'active', '2019-03-15', '1992-01-01', '13800138001', 'lisi@example.com'])
    db.run(`INSERT INTO employee (id, name, id_number, dept_id, position_id, status, entry_date, birth_date, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['emp-003', '王五', '110101199301011234', 'dept-003', 'pos-005', 'active', '2021-06-01', '1993-01-01', '13800138002', 'wangwu@example.com'])

    // 插入示例用户
    db.run(`INSERT INTO user (id, username, password, employee_id, role) VALUES (?, ?, ?, ?, ?)`, ['user-001', 'admin', 'admin123', 'emp-001', 'admin'])
    db.run(`INSERT INTO user (id, username, password, employee_id, role) VALUES (?, ?, ?, ?, ?)`, ['user-002', 'hr', 'hr123', 'emp-001', 'hr_manager'])
    db.run(`INSERT INTO user (id, username, password, employee_id, role) VALUES (?, ?, ?, ?, ?)`, ['user-003', 'tech', 'tech123', 'emp-002', 'dept_head'])
    db.run(`INSERT INTO user (id, username, password, employee_id, role) VALUES (?, ?, ?, ?, ?)`, ['user-004', 'market', 'market123', 'emp-003', 'dept_head'])
  }

  saveDatabase()
  return db
}

// 保存数据库到文件
export function saveDatabase() {
  if (db) {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(dbPath, buffer)
  }
}

// 获取数据库实例
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

// 查询辅助函数
export function queryAll(sql: string, params: any[] = []): any[] {
  const stmt = db!.prepare(sql)
  stmt.bind(params)
  
  const results: any[] = []
  while (stmt.step()) {
    results.push(stmt.getAsObject())
  }
  stmt.free()
  return results
}

export function queryOne(sql: string, params: any[] = []): any {
  const stmt = db!.prepare(sql)
  stmt.bind(params)
  
  let result = null
  if (stmt.step()) {
    result = stmt.getAsObject()
  }
  stmt.free()
  return result
}

export function execute(sql: string, params: any[] = []) {
  db!.run(sql, params)
  saveDatabase()
}
