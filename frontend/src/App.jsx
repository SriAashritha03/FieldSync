import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import WorkerDashboard from './pages/WorkerDashboard'
import SubmitForm from './pages/SubmitForm'
import Reports from './pages/Reports'
import SubmissionDetail from './pages/SubmissionDetail'
import UserManagement from './pages/UserManagement'
import ProjectManagement from './pages/ProjectManagement'
import AuditLogs from './pages/AuditLogs'
import AdminLayout from './layouts/AdminLayout'
import WorkerLayout from './layouts/WorkerLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { getOfflineSubmissions, deleteOffline } from './services/db'
import { createSubmission } from './services/submissionService'

function App() {
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Back online. Checking for offline submissions...')
      try {
        const offlineData = await getOfflineSubmissions()
        if (offlineData.length > 0) {
          for (const item of offlineData) {
            const { id, synced, createdAt, ...payload } = item
            payload.offlineStatus = { isOffline: true, syncedAt: new Date() }
            await createSubmission(payload)
            await deleteOffline(id)
          }
          alert(`Successfully synced ${offlineData.length} offline submissions.`)
        }
      } catch (err) {
        console.error('Failed to sync offline data', err)
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="reports" element={<Reports />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="projects" element={<ProjectManagement />} />
              <Route path="audit" element={<AuditLogs />} />
              <Route path="submissions/:id" element={<SubmissionDetail />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={['worker', 'admin']} />}>
            <Route path="/worker" element={<WorkerLayout />}>
              <Route index element={<WorkerDashboard />} />
              <Route path="submit" element={<SubmitForm />} />
              <Route path="submissions/:id" element={<SubmissionDetail />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
