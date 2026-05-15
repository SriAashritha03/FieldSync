import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import FormInput from '../components/FormInput'
import Loading from '../components/Loading'
import { fetchSummary } from '../services/aiService'
import { fetchSubmissions } from '../services/submissionService'

const Reports = () => {
	const today = new Date().toISOString().split('T')[0]
	const [filters, setFilters] = useState({
		from: '',
		to: today,
		search: '',
		region: '',
	})
	const [summary, setSummary] = useState('')
	const [rows, setRows] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const handleChange = (event) => {
		setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }))
	}

	const loadReport = useCallback(async (nextFilters) => {
		setLoading(true)
		setError('')
		try {
			const [summaryData, submissions] = await Promise.all([
				fetchSummary({
					from: nextFilters.from || undefined,
					to: nextFilters.to,
				}),
				fetchSubmissions({
					search: nextFilters.search || undefined,
					region: nextFilters.region || undefined,
					from: nextFilters.from || undefined,
					to: nextFilters.to || undefined,
					limit: 10,
				}),
			])

			setSummary(summaryData.summaryText)
			setRows(submissions)
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to load reports')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		loadReport(filters)
	}, [filters, loadReport])

	const handleSubmit = (event) => {
		event.preventDefault()
		loadReport(filters)
	}

	if (loading) {
		return <Loading label="Preparing report" />
	}

	return (
		<section className="page-section">
			<div className="page-header">
				<div>
					<p className="eyebrow">Reports</p>
					<h1>AI summary and searchable data</h1>
					<p className="subtext">
						Auto-generate weekly insights and explore field submissions.
					</p>
				</div>
			</div>

			{error && <div className="notice error">{error}</div>}

			<div className="card form-card">
				<form className="form" onSubmit={handleSubmit}>
					<div className="form-grid">
						<FormInput
							id="from"
							label="From"
							type="date"
							value={filters.from}
							onChange={handleChange}
						/>
						<FormInput
							id="to"
							label="To"
							type="date"
							value={filters.to}
							onChange={handleChange}
							required
						/>
						<FormInput
							id="region"
							label="Region"
							value={filters.region}
							onChange={handleChange}
							placeholder="Search by region"
						/>
						<FormInput
							id="search"
							label="Keyword"
							value={filters.search}
							onChange={handleChange}
							placeholder="Issue, activity, notes"
						/>
					</div>
					<button type="submit" className="btn btn-primary">
						Refresh report
					</button>
				</form>
			</div>

			<div className="card">
				<div className="card-header">
					<h3>Summary</h3>
					<span className="badge">AI insight</span>
				</div>
				<p className="summary-text">{summary}</p>
			</div>

			<div className="card">
				<div className="card-header">
					<h3>Recent submissions</h3>
					<span className="badge">Filtered</span>
				</div>
				{rows.length === 0 ? (
					<p className="subtext">No records match your filters.</p>
				) : (
					<div className="table">
						{rows.map((item) => (
							<div key={item._id} className="table-row">
								<div>
									<p className="table-title">
										{item.beneficiary?.identifier || 'Unknown'}
									</p>
									<p className="table-meta">beneficiary ID</p>
								</div>
								<div>
									<p className="table-title">
										{item.project?.code || 'N/A'}
									</p>
									<p className="table-meta">project</p>
								</div>
								<div>
									<p className="table-title">{item.activityType}</p>
									<p className="table-meta">{item.region}</p>
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
								<div>
									<p className="table-title">{item.issues || 'No issues'}</p>
									<p className="table-meta">issues</p>
								</div>
								<div className="table-action">
									<Link className="link-arrow" to={`/admin/submissions/${item._id}`}>
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

export default Reports
