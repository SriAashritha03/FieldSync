import api from './apiClient'

export const registerUser = async (payload) => {
	const response = await api.post('/api/auth/register', payload)
	return response.data
}

export const loginUser = async (payload) => {
	const response = await api.post('/api/auth/login', payload)
	return response.data
}

export const getMe = async () => {
	const response = await api.get('/api/auth/me')
	return response.data
}
