import api from './apiClient'

const appendField = (formData, key, value) => {
	if (value === undefined || value === null) {
		return
	}
	if (Array.isArray(value)) {
		formData.append(key, JSON.stringify(value))
		return
	}
	if (typeof value === 'object') {
		formData.append(key, JSON.stringify(value))
		return
	}
	formData.append(key, value)
}

export const createSubmission = async (payload) => {
	const hasFiles = payload?.mediaFiles && payload.mediaFiles.length > 0

	if (!hasFiles) {
		const { mediaFiles, ...rest } = payload
		const response = await api.post('/api/submissions', rest)
		return response.data
	}

	const formData = new FormData()
	Object.entries(payload).forEach(([key, value]) => {
		if (key === 'mediaFiles') {
			return
		}
		appendField(formData, key, value)
	})

	Array.from(payload.mediaFiles).forEach((file) => {
		formData.append('media', file)
	})

	const response = await api.post('/api/submissions', formData)
	return response.data
}

export const fetchSubmissions = async (params = {}) => {
	const response = await api.get('/api/submissions', { params })
	return response.data
}

export const fetchMetrics = async () => {
	const response = await api.get('/api/submissions/metrics')
	return response.data
}

export const fetchSubmissionById = async (id) => {
	const response = await api.get(`/api/submissions/${id}`)
	return response.data
}
