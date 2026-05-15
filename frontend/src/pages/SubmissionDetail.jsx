import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Loading from '../components/Loading'
import { fetchSubmissionById } from '../services/submissionService'

const formatDate = (value) => {
	if (!value) {
		return 'N/A'
	}
	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
}

const formatValue = (value) => {
	if (value === null || value === undefined || value === '') {
		return 'N/A'
	}
	return value
}

const SubmissionDetail = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const [submission, setSubmission] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const mediaBaseUrl = useMemo(() => {
		const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
		return base.endsWith('/') ? base.slice(0, -1) : base
	}, [])

	useEffect(() => {
		let mounted = true

		const loadSubmission = async () => {
			try {
				const data = await fetchSubmissionById(id)
				if (mounted) {
					setSubmission(data)
				}
			} catch (err) {
				if (mounted) {
					setError(err.response?.data?.message || 'Unable to load submission')
				}
			} finally {
				if (mounted) {
					setLoading(false)
				}
			}
		}

		loadSubmission()
		return () => {
			mounted = false
		}
	}, [id])

	if (loading) {
		return <Loading label="Loading submission" />
	}

	if (!submission) {
		return (
			<section className="page-section">
				<button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
					&lt;- Back
				</button>
				{error && <div className="notice error">{error}</div>}
			</section>
		)
	}

	const mediaItems = submission.media || []
	const beneficiary = submission.beneficiary || {}
	const project = submission.project || {}
	const metrics = submission.metrics || {}
	const feedback = submission.feedback || {}
	const staff = submission.staff || {}
	const geo = submission.geo || {}
	const offline = submission.offlineStatus || {}

	return (
		<section className="page-section">
			<div className="page-header">
				<div>
					<p className="eyebrow">Submission detail</p>
					<h1>{submission.activityType}</h1>
					<p className="subtext">
						{submission.region} - {formatDate(submission.activityDate)}
					</p>
				</div>
				<button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
					&lt;- Back
				</button>
			</div>

			{error && <div className="notice error">{error}</div>}

			<div className="card detail-grid">
				<div>
					<p className="detail-label">Project</p>
					<p className="detail-value">{formatValue(project.code)}</p>
					<p className="detail-meta">{formatValue(project.name)}</p>
				</div>
				<div>
					<p className="detail-label">Beneficiaries reached</p>
					<p className="detail-value">{formatValue(submission.beneficiaryCount)}</p>
					<p className="detail-meta">Target {formatValue(metrics.targetBeneficiaries)}</p>
				</div>
				<div>
					<p className="detail-label">Funds disbursed</p>
					<p className="detail-value">{formatValue(metrics.fundsDisbursed)}</p>
					<p className="detail-meta">Items {formatValue(metrics.itemsDistributed)}</p>
				</div>
				<div>
					<p className="detail-label">Training hours</p>
					<p className="detail-value">{formatValue(metrics.trainingHours)}</p>
					<p className="detail-meta">Satisfaction {formatValue(feedback.satisfaction)}</p>
				</div>
			</div>

			<div className="card detail-section">
				<h3>Beneficiary information</h3>
				<div className="detail-grid">
					<div>
						<p className="detail-label">Identifier</p>
						<p className="detail-value">{formatValue(beneficiary.identifier)}</p>
					</div>
					<div>
						<p className="detail-label">Name</p>
						<p className="detail-value">{formatValue(beneficiary.name)}</p>
					</div>
					<div>
						<p className="detail-label">Gender</p>
						<p className="detail-value">{formatValue(beneficiary.gender)}</p>
					</div>
					<div>
						<p className="detail-label">Age / DOB</p>
						<p className="detail-value">
							{formatValue(beneficiary.age)} / {formatDate(beneficiary.dateOfBirth)}
						</p>
					</div>
					<div>
						<p className="detail-label">Socioeconomic status</p>
						<p className="detail-value">{formatValue(beneficiary.socioeconomicStatus)}</p>
					</div>
					<div>
						<p className="detail-label">Contact</p>
						<p className="detail-value">
							{formatValue(beneficiary.phonePrimary)} / {formatValue(beneficiary.phoneSecondary)}
						</p>
					</div>
					<div>
						<p className="detail-label">Address</p>
						<p className="detail-value">{formatValue(beneficiary.address)}</p>
					</div>
					<div>
						<p className="detail-label">Village</p>
						<p className="detail-value">{formatValue(beneficiary.village)}</p>
					</div>
					<div>
						<p className="detail-label">Vulnerability</p>
						<p className="detail-value">
							{beneficiary.vulnerabilityStatus?.length
								? beneficiary.vulnerabilityStatus.join(', ')
								: 'None'}
						</p>
					</div>
					<div>
						<p className="detail-label">Consent</p>
						<p className="detail-value">
							{beneficiary.consentGiven ? 'Yes' : 'No'}
						</p>
					</div>
				</div>
			</div>

			<div className="card detail-section">
				<h3>Monitoring and evaluation</h3>
				<div className="detail-grid">
					<div>
						<p className="detail-label">Qualitative feedback</p>
						<p className="detail-value">{formatValue(feedback.qualitative)}</p>
					</div>
					<div>
						<p className="detail-label">Issues</p>
						<p className="detail-value">{formatValue(submission.issues)}</p>
					</div>
					<div>
						<p className="detail-label">Notes</p>
						<p className="detail-value">{formatValue(submission.notes)}</p>
					</div>
				</div>
			</div>

			<div className="card detail-section">
				<h3>Staff and submission metadata</h3>
				<div className="detail-grid">
					<div>
						<p className="detail-label">Staff ID</p>
						<p className="detail-value">{formatValue(staff.staffId)}</p>
					</div>
					<div>
						<p className="detail-label">Staff name</p>
						<p className="detail-value">{formatValue(staff.staffName)}</p>
					</div>
					<div>
						<p className="detail-label">Collected by</p>
						<p className="detail-value">{formatValue(submission.worker?.name)}</p>
						<p className="detail-meta">{formatValue(submission.worker?.email)}</p>
					</div>
					<div>
						<p className="detail-label">Submitted at</p>
						<p className="detail-value">{formatDate(submission.createdAt)}</p>
						<p className="detail-meta">Updated {formatDate(submission.updatedAt)}</p>
					</div>
				</div>
			</div>

			<div className="card detail-section">
				<h3>Geo and sync status</h3>
				<div className="detail-grid">
					<div>
						<p className="detail-label">Latitude</p>
						<p className="detail-value">{formatValue(geo.lat)}</p>
					</div>
					<div>
						<p className="detail-label">Longitude</p>
						<p className="detail-value">{formatValue(geo.lng)}</p>
					</div>
					<div>
						<p className="detail-label">Accuracy</p>
						<p className="detail-value">{formatValue(geo.accuracy)}</p>
					</div>
					<div>
						<p className="detail-label">Captured at</p>
						<p className="detail-value">{formatDate(geo.capturedAt)}</p>
					</div>
					<div>
						<p className="detail-label">Offline</p>
						<p className="detail-value">{offline.isOffline ? 'Yes' : 'No'}</p>
					</div>
					<div>
						<p className="detail-label">Synced at</p>
						<p className="detail-value">{formatDate(offline.syncedAt)}</p>
					</div>
				</div>
			</div>

			<div className="card detail-section">
				<h3>Media uploads</h3>
				{mediaItems.length === 0 ? (
					<p className="subtext">No media attached.</p>
				) : (
					<div className="media-grid">
						{mediaItems.map((item) => {
							const mediaUrl = item.url
								? item.url.startsWith('http')
									? item.url
									: `${mediaBaseUrl}${item.url}`
								: ''

							return (
								<div key={item.filename} className="media-card">
									{item.mimetype?.startsWith('video/') ? (
										<video controls src={mediaUrl} />
									) : (
										<img src={mediaUrl} alt={item.filename || 'Upload'} />
									)}
									<p className="detail-meta">{item.filename}</p>
								</div>
							)
						})}
					</div>
				)}
			</div>
		</section>
	)
}

export default SubmissionDetail
