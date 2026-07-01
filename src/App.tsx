import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/personnel/Employees'
import Organization from './pages/personnel/Organization'
import RecruitmentDemands from './pages/recruitment/Demands'
import PromotionPlans from './pages/promotion/Plans'
import PromotionApplications from './pages/promotion/Applications'
import QualificationReview from './pages/promotion/QualificationReview'
import DemocraticReview from './pages/promotion/DemocraticReview'
import CommitteeReview from './pages/promotion/CommitteeReview'
import Publicity from './pages/promotion/Publicity'
import CadrePlans from './pages/cadre/Plans'
import PerformanceSchemes from './pages/performance/Schemes'
import AttendanceRecords from './pages/attendance/Records'
import ResignationApplications from './pages/resignation/Applications'
import WorkflowApprovals from './pages/workflow/Approvals'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="personnel/employees" element={<Employees />} />
          <Route path="personnel/organization" element={<Organization />} />
          <Route path="recruitment/demands" element={<RecruitmentDemands />} />
          <Route path="promotion/plans" element={<PromotionPlans />} />
          <Route path="promotion/applications" element={<PromotionApplications />} />
          <Route path="promotion/qualification-review" element={<QualificationReview />} />
          <Route path="promotion/democratic-review" element={<DemocraticReview />} />
          <Route path="promotion/committee-review" element={<CommitteeReview />} />
          <Route path="promotion/publicity" element={<Publicity />} />
          <Route path="cadre/plans" element={<CadrePlans />} />
          <Route path="performance/schemes" element={<PerformanceSchemes />} />
          <Route path="attendance/records" element={<AttendanceRecords />} />
          <Route path="resignation/applications" element={<ResignationApplications />} />
          <Route path="workflow/approvals" element={<WorkflowApprovals />} />
        </Route>
      </Routes>
    </Router>
  )
}
