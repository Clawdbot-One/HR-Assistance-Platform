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

  // 晋升记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS promotion_record (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      from_position_id TEXT,
      to_position_id TEXT,
      promotion_date DATE,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employee(id)
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
