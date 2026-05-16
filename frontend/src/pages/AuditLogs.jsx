import { useState, useEffect } from 'react'
import api from '../services/apiClient'
import Loading from '../components/Loading'

const AuditLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/api/audit')
      setLogs(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading label="Loading logs..." />

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Audit Logs</h1>
        </div>
      </div>
      
      <div className="card">
        <div className="table">
          {logs.map((log) => (
            <div key={log._id} className="table-row">
              <div>
                <p className="table-title">{log.action}</p>
                <p className="table-meta">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="table-title">{log.details}</p>
                <p className="table-meta">Admin: {log.adminId ? log.adminId.name : 'System'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AuditLogs
