import api from './apiClient'

export const getProjects = async () => {
  const { data } = await api.get('/api/projects')
  return data
}

export const createProject = async (projectData) => {
  const { data } = await api.post('/api/projects', projectData)
  return data
}
