import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getMe, loginUser, registerUser } from '../services/authService'
import { setAuthToken } from '../services/apiClient'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) {
			setLoading(false)
			return
		}

		setAuthToken(token)
		getMe()
			.then((data) => {
				setUser(data.user)
			})
			.catch(() => {
				localStorage.removeItem('token')
				setAuthToken(null)
			})
			.finally(() => setLoading(false))
	}, [])

	const login = async (payload) => {
		const data = await loginUser(payload)
		localStorage.setItem('token', data.token)
		setAuthToken(data.token)
		setUser(data.user)
		return data
	}

	const register = async (payload) => {
		const data = await registerUser(payload)
		localStorage.setItem('token', data.token)
		setAuthToken(data.token)
		setUser(data.user)
		return data
	}

	const logout = () => {
		localStorage.removeItem('token')
		setAuthToken(null)
		setUser(null)
	}

	const value = useMemo(
		() => ({
			user,
			loading,
			login,
			register,
			logout,
		}),
		[user, loading]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider')
	}
	return context
}
