	import api from './apiClient'

	export const fetchSummary = async (params = {}) => {
		const response = await api.get('/api/reports/summary', { params })
		return response.data
	}

	export const fetchInsights = async (params = {}) => {
		const response = await api.get('/api/reports/insights', { params })
		return response.data
	}
    