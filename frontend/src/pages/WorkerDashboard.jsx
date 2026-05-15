import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loading from '../components/Loading'
import { fetchMetrics, fetchSubmissions } from '../services/submissionService'

const WorkerDashboard = () => {
	const [metrics, setMetrics] = useState(null)
	const [recent, setRecent] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		let mounted = true

		const loadData = async () => {
			try {
				const [metricData, recentData] = await Promise.all([
					fetchMetrics(),
					fetchSubmissions({ limit: 5 }),
				])

				if (mounted) {
					setMetrics(metricData)
					setRecent(recentData)
				}
			} catch (err) {
				if (mounted) {
					setError(err.response?.data?.message || 'Unable to load dashboard')
				}
			} finally {
				if (mounted) {
					setLoading(false)
				}
			}
		}

		loadData()
		return () => {
			mounted = false
		}
	}, [])

	if (loading) {
		return <Loading label="Loading dashboard" />
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

			<div className="card">
				<div className="card-header">
					<h3>Recent submissions</h3>
					<span className="badge">Latest 5</span>
				</div>
				{recent.length === 0 ? (
					<p className="subtext">No submissions yet. Start by adding new data.</p>
				) : (
					<div className="table">
						{recent.map((item) => (
							<div key={item._id} className="table-row">
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
								<div className="table-action">
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
