import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'

const ProtectedRoute = ({ roles }) => {
	const { user, loading } = useAuth()

	if (loading) {
		return <Loading label="Loading session" />
	}

	if (!user) {
		return <Navigate to="/login" replace />
	}

	if (roles && !roles.includes(user.role)) {
		const fallback = user.role === 'admin' ? '/admin' : '/worker'
		return <Navigate to={fallback} replace />
	}

	return <Outlet />
}

export default ProtectedRoute
