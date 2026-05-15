import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput'
import { useAuth } from '../context/AuthContext'

const roleOptions = [
	{ value: 'worker', label: 'Field worker' },
	{ value: 'admin', label: 'Admin' },
]

const Register = () => {
	const { register } = useAuth()
	const navigate = useNavigate()
	const [form, setForm] = useState({
		name: '',
        id:'',
		email: '',
		password: '',
		role: 'worker',
		region: '',
	})
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
			const data = await register(form)
			navigate(data.user.role === 'admin' ? '/admin' : '/worker', {
				replace: true,
			})
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to register')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="auth-shell">
			<div className="auth-card">
				<p className="eyebrow">Create account</p>
				<h1>Set up your FieldSync access</h1>
				<p className="subtext">
					Register once and access dashboards, reporting, and field forms.
				</p>

				<form className="form" onSubmit={handleSubmit}>
					<FormInput
						id="name"
						label="Full name"
						value={form.name}
						onChange={handleChange}
						placeholder="Amina Rahman"
						required
					/>
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
						placeholder="At least 6 characters"
						required
					/>
					<FormInput
						id="role"
						label="Role"
						as="select"
						value={form.role}
						onChange={handleChange}
						options={roleOptions}
					/>
					<FormInput
						id="region"
						label="Primary region"
						value={form.region}
						onChange={handleChange}
						placeholder="Northern Zone"
					/>

					{error && <div className="notice error">{error}</div>}

					<button type="submit" className="btn btn-primary" disabled={loading}>
						{loading ? 'Creating account...' : 'Create account'}
					</button>
				</form>

				<div className="auth-footer">
					<span>Already registered?</span>
					<Link to="/login">Log in</Link>
				</div>
			</div>
		</div>
	)
}

export default Register
