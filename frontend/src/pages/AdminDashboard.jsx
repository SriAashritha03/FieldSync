import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loading from '../components/Loading'
import { fetchMetrics, fetchSubmissions } from '../services/submissionService'
import { fetchInsights } from '../services/aiService'

const AdminDashboard = () => {
	const [metrics, setMetrics] = useState(null)
	const [insights, setInsights] = useState([])
	const [recent, setRecent] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const targetTotal = metrics?.totalTarget || 0
	const actualTotal = metrics?.totalBeneficiaries || 0
	const progressPercent =
		targetTotal > 0 ? Math.min(100, Math.round((actualTotal / targetTotal) * 100)) : 0

	useEffect(() => {
		let mounted = true

		const loadData = async () => {
			try {
				const [metricData, insightData, recentData] = await Promise.all([
					fetchMetrics(),
					fetchInsights(),
					fetchSubmissions({ limit: 6 }),
				])

				if (mounted) {
					setMetrics(metricData)
					setInsights(insightData.insights || [])
					setRecent(recentData)
				}
			} catch (err) {
				if (mounted) {
					setError(err.response?.data?.message || 'Unable to load admin data')
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
		return <Loading label="Loading admin dashboard" />
	}

	return (
		<section className="page-section">
			<div className="page-header">
				<div>
					<p className="eyebrow">Admin</p>
					<h1>Operations pulse</h1>
					<p className="subtext">
						Unified visibility into field activity and engagement.
					</p>
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
				<div className="card metric">
					<p className="metric-label">Top region</p>
					<h3 className="metric-value">
						{metrics?.topRegion?._id || 'N/A'}
					</h3>
				</div>
				<div className="card metric">
					<p className="metric-label">Funds disbursed</p>
					<h3 className="metric-value">
						{(metrics?.totalFunds || 0).toLocaleString()}
					</h3>
				</div>
			</div>

			<div className="card-grid two-columns">
				<div className="card">
					<div className="card-header">
						<h3>AI insights</h3>
						<span className="badge">Auto-generated</span>
					</div>
					{insights.length === 0 ? (
						<p className="subtext">No insights yet. Add submissions to unlock reports.</p>
					) : (
						<ul className="insight-list">
							{insights.map((insight, index) => (
								<li key={`${insight}-${index}`}>{insight}</li>
							))}
						</ul>
					)}
				</div>
				<div className="card">
					<div className="card-header">
						<h3>Activity mix</h3>
						<span className="badge">Top types</span>
					</div>
					<div className="stack">
						{(metrics?.activityStats || []).slice(0, 4).map((item) => (
							<div key={item._id} className="stack-row">
								<span>{item._id}</span>
								<strong>{item.count}</strong>
							</div>
						))}
						{(!metrics?.activityStats || metrics?.activityStats?.length === 0) && (
							<p className="subtext">No activity data yet.</p>
						)}
					</div>
				</div>
				<div className="card">
					<div className="card-header">
						<h3>Target vs actual</h3>
						<span className="badge">Progress</span>
					</div>
					<div className="progress">
						<div
							className="progress-bar"
							style={{ width: `${progressPercent}%` }}
						/>
					</div>
					<p className="progress-meta">
						{actualTotal} of {targetTotal || 'N/A'} beneficiaries reached
					</p>
				</div>
			</div>

			<div className="card">
				<div className="card-header">
					<h3>Geographic coverage</h3>
					<span className="badge">Heatmap ready</span>
				</div>
				<div className="stack">
					{(metrics?.regionStats || []).slice(0, 5).map((item) => (
						<div key={item._id} className="stack-row">
							<span>{item._id}</span>
							<strong>{item.count}</strong>
						</div>
					))}
					{(!metrics?.regionStats || metrics.regionStats.length === 0) && (
						<p className="subtext">No geo data yet.</p>
					)}
				</div>
			</div>

			<div className="card">
				<div className="card-header">
					<h3>Recent submissions</h3>
					<span className="badge">Latest 6</span>
				</div>
				{recent.length === 0 ? (
					<p className="subtext">No submissions recorded yet.</p>
				) : (
					<div className="table">
						{recent.map((item) => (
							<div key={item._id} className="table-row">
								<div>
									<p className="table-title">{item.activityType}</p>
									<p className="table-meta">{item.region}</p>
								</div>
								<div>
									<p className="table-title">{item.worker?.name || 'Worker'}</p>
									<p className="table-meta">{item.worker?.email || ''}</p>
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

export default AdminDashboard
