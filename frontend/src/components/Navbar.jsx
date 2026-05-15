import { useAuth } from '../context/AuthContext'

const Navbar = () => {
	const { user, logout } = useAuth()

	return (
		<header className="navbar">
			<div>
				<p className="eyebrow">FieldSync</p>
				<h2 className="navbar-title">NGO Field Data Console</h2>
			</div>
			<div className="nav-actions">
				<div className="user-chip">
					<span className="user-name">{user?.name || 'User'}</span>
					<span className="user-role">{user?.role}</span>
				</div>
				<button type="button" className="btn btn-ghost" onClick={logout}>
					Log out
				</button>
			</div>
		</header>
	)
}

export default Navbar
