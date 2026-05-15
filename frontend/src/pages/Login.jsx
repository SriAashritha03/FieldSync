import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput'
import { useAuth } from '../context/AuthContext'

const Login = () => {
	const { login } = useAuth()
	const navigate = useNavigate()
	const [form, setForm] = useState({ email: '', password: '' })
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handleChange = (event) => {
		setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		setError('')
		setLoading(true)

		try {
			const data = await login(form)
			navigate(data.user.role === 'admin' ? '/admin' : '/worker', {
				replace: true,
			})
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to log in')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="auth-shell">
			<div className="auth-card">
				<p className="eyebrow">Welcome back</p>
				<h1>Log in to FieldSync</h1>
				<p className="subtext">
					Track field activity, manage data, and generate reports in minutes.
				</p>

				<form className="form" onSubmit={handleSubmit}>
					<FormInput
						id="email"
						label="Email"
						type="email"
						value={form.email}
						onChange={handleChange}
						placeholder="you@example.org"
						required
					/>
					<FormInput
						id="password"
						label="Password"
						type="password"
						value={form.password}
						onChange={handleChange}
						placeholder="Your password"
						required
					/>

					{error && <div className="notice error">{error}</div>}

					<button type="submit" className="btn btn-primary" disabled={loading}>
						{loading ? 'Signing in...' : 'Log in'}
					</button>
				</form>

				<div className="auth-footer">
					<span>New to FieldSync?</span>
					<Link to="/register">Create an account</Link>
				</div>
			</div>
		</div>
	)
}

export default Login
