import { useState, useEffect } from 'react'
import api from '../services/apiClient'
import Loading from '../components/Loading'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/api/users')
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/api/users/${id}/status`, { status })
      fetchUsers()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <Loading label="Loading users..." />

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>User Management</h1>
        </div>
      </div>
      <div className="card">
        <div className="table">
          {users.map((user) => (
            <div key={user._id} className="table-row">
              <div>
                <p className="table-title">{user.name}</p>
                <p className="table-meta">{user.email}</p>
              </div>
              <div>
                <p className="table-title">{user.empId}</p>
                <p className="table-meta">Employee ID</p>
              </div>
              <div>
                <p className="table-title">{user.status}</p>
                <p className="table-meta">Status</p>
              </div>
              <div className="table-action" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {user.status === 'pending' && (
                  <span className="subtext" style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>Pending email approval</span>
                )}
                {user.status === 'approved' && (
                  <button onClick={() => handleStatusChange(user._id, 'inactive')} className="btn btn-ghost" style={{ padding: '5px 10px' }}>Deactivate</button>
                )}
                {user.status === 'inactive' && (
                  <button onClick={() => handleStatusChange(user._id, 'approved')} className="btn btn-ghost" style={{ padding: '5px 10px', color: 'green' }}>Re-activate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default UserManagement
