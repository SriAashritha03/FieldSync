import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Loading from '../components/Loading'
import FormInput from '../components/FormInput'
import { fetchMetrics, fetchSubmissions } from '../services/submissionService'
import api from '../services/apiClient'
import { useAuth } from '../context/AuthContext'
import * as XLSX from 'xlsx'

const WorkerDashboard = () => {
	const { user } = useAuth()
	const [metrics, setMetrics] = useState(null)
	const [rows, setRows] = useState([])
	const [workers, setWorkers] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const today = new Date().toISOString().split('T')[0]
	const [filters, setFilters] = useState({
		from: '',
		to: today,
		region: '',
		workerId: ''
	})

	const handleChange = (e) => {
		setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
	}

	const loadData = useCallback(async (currentFilters) => {
		try {
			setError('')
			const params = {
				region: currentFilters.region || undefined,
				from: currentFilters.from || undefined,
				to: currentFilters.to || undefined,
				workerId: currentFilters.workerId || undefined
			}
			const [metricData, tableData] = await Promise.all([
				fetchMetrics(),
				fetchSubmissions(params),
			])
			setMetrics(metricData)
			setRows(tableData)
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to load dashboard')
		}
	}, [])

	useEffect(() => {
		const init = async () => {
			setLoading(true)
			if (user?.role === 'admin') {
				try {
					const { data } = await api.get('/api/users')
					setWorkers(data)
				} catch (err) {
					console.error('Failed to load workers', err)
				}
			}
			await loadData(filters)
			setLoading(false)
		}
		init()
	}, [user, loadData]) // Load once on mount

	const handleSubmit = (e) => {
		e.preventDefault()
		loadData(filters)
	}

	const handleExportExcel = () => {
		if (!rows || rows.length === 0) return
		const exportData = rows.map(item => ({
			'Beneficiary ID': item.beneficiary?.identifier || 'Unknown',
			'Project Code': item.project?.code || 'N/A',
			'Activity': item.activityType,
			'Region': item.region,
			'Worker': item.worker?.name || 'Unknown',
			'Beneficiaries': item.beneficiaryCount,
			'Date': new Date(item.activityDate).toLocaleDateString(),
			'Issues': item.issues || 'No issues'
		}))
		const worksheet = XLSX.utils.json_to_sheet(exportData)
		const workbook = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Submissions')
		XLSX.writeFile(workbook, `fieldsync-submissions-${today}.xlsx`)
	}

	if (loading) {
		return <Loading label="Loading submissions" />
	}

	return (
		<section className="page-section">
			<div className="page-header">
				<div>
					<p className="eyebrow">Field worker</p>
					<h1>Your activity overview</h1>
					<p className="subtext">Stay on top of your submissions and impact.</p>
				</div>
			</div>

			{error && <div className="notice error">{error}</div>}

			<div className="card-grid">
				<div className="card metric">
					<p className="metric-label">Total submissions</p>
					<h3 className="metric-value">{metrics?.totalSubmissions || 0}</h3>
				</div>
				<div className="card metric">
					<p className="metric-label">Beneficiaries reached</p>
					<h3 className="metric-value">{metrics?.totalBeneficiaries || 0}</h3>
				</div>
				<div className="card metric">
					<p className="metric-label">Unique beneficiaries</p>
					<h3 className="metric-value">{metrics?.uniqueBeneficiaries || 0}</h3>
				</div>
				<div className="card metric">
					<p className="metric-label">Last 7 days</p>
					<h3 className="metric-value">{metrics?.recentSubmissions || 0}</h3>
				</div>
			</div>

			<div className="card form-card no-print">
				<form className="form" onSubmit={handleSubmit}>
					<div className="form-grid">
						<FormInput id="from" label="From" type="date" value={filters.from} onChange={handleChange} />
						<FormInput id="to" label="To" type="date" value={filters.to} onChange={handleChange} />
						<FormInput id="region" label="Location/Region" value={filters.region} onChange={handleChange} placeholder="e.g. Hyd" />
						{user?.role === 'admin' && (
							<FormInput id="workerId" label="Specific Worker" as="select" value={filters.workerId} onChange={handleChange} options={[
								{ value: '', label: 'All Workers' },
								...workers.map(w => ({ value: w._id, label: `${w.name} (${w.empId})` }))
							]} />
						)}
					</div>
					<div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
						<button type="submit" className="btn btn-primary">Filter results</button>
						<button type="button" className="btn btn-ghost" onClick={handleExportExcel}>Export Excel</button>
					</div>
				</form>
			</div>

			<div className="card">
				<div className="card-header">
					<h3>All submissions</h3>
					<span className="badge">Filtered</span>
				</div>
				{rows.length === 0 ? (
					<p className="subtext">No submissions found matching filters.</p>
				) : (
					<div className="table">
						{rows.map((item) => (
							<div key={item._id} className="table-row">
								<div>
									<p className="table-title">{item.activityType}</p>
									<p className="table-meta">{item.region}</p>
								</div>
								<div>
									<p className="table-title">{item.worker?.name || 'Worker'}</p>
									<p className="table-meta">Worker</p>
								</div>
								<div>
									<p className="table-title">{item.beneficiaryCount}</p>
									<p className="table-meta">beneficiaries</p>
								</div>
								<div>
									<p className="table-title">
										{new Date(item.activityDate).toLocaleDateString()}
									</p>
									<p className="table-meta">date</p>
								</div>
								<div className="table-action no-print">
									<Link className="link-arrow" to={`/worker/submissions/${item._id}`}>
										Details -&gt;
									</Link>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	)
}

export default WorkerDashboard
