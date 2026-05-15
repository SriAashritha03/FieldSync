import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
	const { user } = useAuth()
	const role = user?.role

	return (
		<aside className="sidebar">
			<div className="brand">
				<span className="brand-mark">FS</span>
				<div>
					<h1>FieldSync</h1>
					<p>Unified NGO operations</p>
				</div>
			</div>

			<nav className="nav-list">
				{role === 'admin' && (
					<>
						<NavLink
							to="/admin"
							end
							className={({ isActive }) =>
								isActive ? 'nav-link active' : 'nav-link'
							}
						>
							Dashboard
						</NavLink>
						<NavLink
							to="/admin/reports"
							className={({ isActive }) =>
								isActive ? 'nav-link active' : 'nav-link'
							}
						>
							Reports
						</NavLink>
					</>
				)}

				{(role === 'worker' || role === 'admin') && (
					<>
						<NavLink
							to="/worker"
							end
							className={({ isActive }) =>
								isActive ? 'nav-link active' : 'nav-link'
							}
						>
							Worker view
						</NavLink>
						<NavLink
							to="/worker/submit"
							className={({ isActive }) =>
								isActive ? 'nav-link active' : 'nav-link'
							}
						>
							Submit data
						</NavLink>
					</>
				)}
			</nav>

			<div className="sidebar-footer">
				<p>Role: {role || 'unknown'}</p>
				<span>Data stays centralized and searchable.</span>
			</div>
		</aside>
	)
}

export default Sidebar
