import { useState, useEffect } from 'react'
import api from '../services/apiClient'
import Loading from '../components/Loading'

const ProjectManagement = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', code: '', description: '' })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/api/projects')
      setProjects(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/projects', form)
      setForm({ name: '', code: '', description: '' })
      fetchProjects()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <Loading label="Loading projects..." />

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Project Management</h1>
        </div>
      </div>
      
      <div className="card form-card">
        <form className="form" onSubmit={handleCreate}>
          <div className="section-title">Create New Project</div>
          <div className="form-grid">
            <input placeholder="Project Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="file-input" />
            <input placeholder="Project Code" required value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="file-input" />
            <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="file-input" />
          </div>
          <button type="submit" className="btn btn-primary" style={{marginTop: '15px'}}>Create Project</button>
        </form>
      </div>

      <div className="card mt-4">
        <div className="table">
          {projects.map((project) => (
            <div key={project._id} className="table-row">
              <div>
                <p className="table-title">{project.name}</p>
                <p className="table-meta">{project.code}</p>
              </div>
              <div>
                <p className="table-title">{project.status}</p>
                <p className="table-meta">Status</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProjectManagement
