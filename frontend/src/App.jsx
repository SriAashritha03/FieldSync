import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import WorkerDashboard from './pages/WorkerDashboard'
import SubmitForm from './pages/SubmitForm'
import Reports from './pages/Reports'
import SubmissionDetail from './pages/SubmissionDetail'
import AdminLayout from './layouts/AdminLayout'
import WorkerLayout from './layouts/WorkerLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

function App() {
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
