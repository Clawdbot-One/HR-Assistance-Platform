/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import employeeRoutes from './routes/employees.js'
import departmentRoutes from './routes/departments.js'
import recruitmentRoutes from './routes/recruitment.js'
import attendanceRoutes from './routes/attendance.js'
import workflowRoutes from './routes/workflow.js'
import resignationRoutes from './routes/resignation.js'
import promotionRoutes from './routes/promotion.js'
import { initDatabase } from './db.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

// 异步初始化数据库
initDatabase().then(() => {
  console.log('数据库初始化成功')
}).catch((err) => {
  console.error('数据库初始化失败:', err)
  process.exit(1)
})

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/departments', departmentRoutes)
app.use('/api/recruitment', recruitmentRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/workflow', workflowRoutes)
app.use('/api/resignation', resignationRoutes)
app.use('/api/promotion', promotionRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
