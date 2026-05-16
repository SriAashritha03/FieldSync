import { useState, useEffect } from 'react'
import FormInput from '../components/FormInput'
import { createSubmission } from '../services/submissionService'
import { getProjects } from '../services/projectService'
import { saveOffline } from '../services/db'
import { useAuth } from '../context/AuthContext'

const activityOptions = [
	{ value: 'Training', label: 'Training' },
	{ value: 'Distribution', label: 'Distribution' },
	{ value: 'Monitoring', label: 'Monitoring' },
	{ value: 'Awareness', label: 'Awareness' },
]

const genderOptions = [
	{ value: 'Female', label: 'Female' },
	{ value: 'Male', label: 'Male' },
	{ value: 'Non-binary', label: 'Non-binary' },
	{ value: 'Other', label: 'Other' },
]

const satisfactionOptions = [
	{ value: 'Very satisfied', label: 'Very satisfied' },
	{ value: 'Satisfied', label: 'Satisfied' },
	{ value: 'Neutral', label: 'Neutral' },
	{ value: 'Unsatisfied', label: 'Unsatisfied' },
]

const vulnerabilityOptions = [
	'Disability',
	'Displacement',
	'Female-headed household',
	'Elderly',
	'Child-headed household',
]

const SubmitForm = () => {
	const { user } = useAuth()
	const today = new Date().toISOString().split('T')[0]
	const [fileInputKey, setFileInputKey] = useState(0)
	const [locationStatus, setLocationStatus] = useState('')
	const [form, setForm] = useState({
		region: user?.region || '',
		activityType: activityOptions[0].value,
		beneficiaryCount: '',
		issues: '',
		notes: '',
		activityDate: today,
		beneficiaryId: '',
		beneficiaryName: '',
		beneficiaryAge: '',
		beneficiaryDob: '',
		beneficiaryGender: genderOptions[0].value,
		socioeconomicStatus: '',
		phonePrimary: '',
		phoneSecondary: '',
		address: '',
		village: '',
		vulnerabilityStatus: [],
		consentGiven: false,
		projectCode: '',
		projectName: '',
		itemsDistributed: '',
		trainingHours: '',
		fundsDisbursed: '',
		targetBeneficiaries: '',
		qualitativeFeedback: '',
		satisfactionLevel: satisfactionOptions[0].value,
		staffId: user?.id || '',
		staffName: user?.name || '',
		geoLat: '',
		geoLng: '',
		geoAccuracy: '',
		geoCapturedAt: '',
		offlineStatus: false,
		syncedAt: '',
		mediaFiles: [],
	})
	const [status, setStatus] = useState(null)
	const [loading, setLoading] = useState(false)
	const [projects, setProjects] = useState([])

	useEffect(() => {
		const fetchProjects = async () => {
			try {
				const data = await getProjects()
				setProjects(data)
			} catch (error) {
				console.error('Failed to fetch projects', error)
			}
		}
		fetchProjects()
	}, [])

	const handleProjectChange = (e) => {
		const code = e.target.value
		const proj = projects.find(p => p.code === code)
		setForm(prev => ({
			...prev,
			projectCode: code,
			projectName: proj ? proj.name : ''
		}))
	}

	const handleChange = (event) => {
		const { name, value, type, checked } = event.target
		setForm((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}))
	}

	const handleVulnerabilityToggle = (value) => {
		setForm((prev) => {
			const exists = prev.vulnerabilityStatus.includes(value)
			return {
				...prev,
				vulnerabilityStatus: exists
					? prev.vulnerabilityStatus.filter((item) => item !== value)
					: [...prev.vulnerabilityStatus, value],
			}
		})
	}

	const handleFiles = (event) => {
		setForm((prev) => ({ ...prev, mediaFiles: event.target.files }))
	}

	const handleCaptureLocation = () => {
		if (!navigator.geolocation) {
			setLocationStatus('Geolocation is not supported on this device.')
			return
		}

		setLocationStatus('Capturing location...')
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setForm((prev) => ({
					...prev,
					geoLat: position.coords.latitude.toFixed(6),
					geoLng: position.coords.longitude.toFixed(6),
					geoAccuracy: Math.round(position.coords.accuracy).toString(),
					geoCapturedAt: new Date().toISOString(),
				}))
				setLocationStatus('Location captured successfully.')
			},
			() => {
				setLocationStatus('Unable to capture location. Please try again.')
			}
		)
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		setStatus(null)
		setLoading(true)

		const payload = {
			region: form.region,
			activityType: form.activityType,
			beneficiaryCount: form.beneficiaryCount,
			issues: form.issues,
			notes: form.notes,
			activityDate: form.activityDate,
			beneficiary: {
				identifier: form.beneficiaryId,
				name: form.beneficiaryName,
				age: form.beneficiaryAge,
				dateOfBirth: form.beneficiaryDob,
				gender: form.beneficiaryGender,
				socioeconomicStatus: form.socioeconomicStatus,
				phonePrimary: form.phonePrimary,
				phoneSecondary: form.phoneSecondary,
				address: form.address,
				village: form.village,
				vulnerabilityStatus: form.vulnerabilityStatus,
				consentGiven: form.consentGiven,
			},
			project: {
				code: form.projectCode,
				name: form.projectName,
			},
			metrics: {
				itemsDistributed: form.itemsDistributed,
				trainingHours: form.trainingHours,
				fundsDisbursed: form.fundsDisbursed,
				targetBeneficiaries: form.targetBeneficiaries,
			},
			feedback: {
				qualitative: form.qualitativeFeedback,
				satisfaction: form.satisfactionLevel,
			},
			staff: {
				staffId: form.staffId,
				staffName: form.staffName,
			},
			geo: {
				lat: form.geoLat,
				lng: form.geoLng,
				accuracy: form.geoAccuracy,
				capturedAt: form.geoCapturedAt,
			},
			offlineStatus: {
				isOffline: form.offlineStatus,
				syncedAt: form.syncedAt,
			},
			mediaFiles: form.mediaFiles,
		}

		try {
			if (!navigator.onLine) {
				await saveOffline(payload)
				setStatus({ type: 'success', message: 'You are offline. Submission saved locally and will automatically sync when you reconnect.' })
			} else {
				await createSubmission(payload)
				setStatus({ type: 'success', message: 'Submission saved successfully.' })
			}

			setForm((prev) => ({
				...prev,
				beneficiaryCount: '',
				issues: '',
				notes: '',
				beneficiaryId: '',
				beneficiaryName: '',
				beneficiaryAge: '',
				beneficiaryDob: '',
				socioeconomicStatus: '',
				phonePrimary: '',
				phoneSecondary: '',
				address: '',
				village: '',
				vulnerabilityStatus: [],
				consentGiven: false,
				itemsDistributed: '',
				trainingHours: '',
				fundsDisbursed: '',
				targetBeneficiaries: '',
				qualitativeFeedback: '',
				geoLat: '',
				geoLng: '',
				geoAccuracy: '',
				geoCapturedAt: '',
				offlineStatus: false,
				syncedAt: '',
				mediaFiles: [],
				activityDate: today,
			}))
			setFileInputKey((prev) => prev + 1)
			setLocationStatus('')
		} catch (err) {
			setStatus({
				type: 'error',
				message: err.response?.data?.message || 'Failed to save submission.',
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<section className="page-section">
			<div className="page-header">
				<div>
					<p className="eyebrow">Field worker</p>
					<h1>Submit field data</h1>
					<p className="subtext">
						Capture beneficiary info, activity updates, and M&amp;E details.
					</p>
				</div>
			</div>

			<div className="card form-card">
				<form className="form" onSubmit={handleSubmit}>
					<div className="section-title">Primary data entry</div>
					<div className="form-grid">
						<FormInput
							id="beneficiaryId"
							label="Beneficiary ID"
							value={form.beneficiaryId}
							onChange={handleChange}
							placeholder="NGO-2024-001"
							required
						/>
						<FormInput
							id="beneficiaryName"
							label="Beneficiary name"
							value={form.beneficiaryName}
							onChange={handleChange}
							placeholder="Amina Rahman"
							required
						/>
						<FormInput
							id="beneficiaryAge"
							label="Age"
							type="number"
							value={form.beneficiaryAge}
							onChange={handleChange}
							min="0"
						/>
						<FormInput
							id="beneficiaryDob"
							label="Date of birth"
							type="date"
							value={form.beneficiaryDob}
							onChange={handleChange}
						/>
						<FormInput
							id="beneficiaryGender"
							label="Gender"
							as="select"
							value={form.beneficiaryGender}
							onChange={handleChange}
							options={genderOptions}
							required
						/>
						<FormInput
							id="socioeconomicStatus"
							label="Socioeconomic status"
							value={form.socioeconomicStatus}
							onChange={handleChange}
							placeholder="Low income, displaced"
						/>
						<FormInput
							id="phonePrimary"
							label="Primary phone"
							type="tel"
							value={form.phonePrimary}
							onChange={handleChange}
						/>
						<FormInput
							id="phoneSecondary"
							label="Secondary phone"
							type="tel"
							value={form.phoneSecondary}
							onChange={handleChange}
						/>
						<FormInput
							id="address"
							label="Address"
							value={form.address}
							onChange={handleChange}
							placeholder="Street, area"
						/>
						<FormInput
							id="village"
							label="Village"
							value={form.village}
							onChange={handleChange}
							placeholder="Village name"
						/>
					</div>

					<div className="field-group">
						<p className="field-label">Vulnerability status</p>
						<div className="tag-group">
							{vulnerabilityOptions.map((option) => (
								<label key={option} className="tag">
									<input
										type="checkbox"
										checked={form.vulnerabilityStatus.includes(option)}
										onChange={() => handleVulnerabilityToggle(option)}
									/>
									<span>{option}</span>
								</label>
							))}
						</div>
					</div>

					<div className="section-title">Project and activity</div>
					<div className="form-grid">
						<FormInput
							id="projectCode"
							label="Project"
							as="select"
							value={form.projectCode}
							onChange={handleProjectChange}
							options={[
								{ value: '', label: 'Select a project' },
								...projects.map(p => ({ value: p.code, label: `${p.name} (${p.code})` }))
							]}
							required
						/>
						<FormInput
							id="region"
							label="Region"
							value={form.region}
							onChange={handleChange}
							placeholder="Northern Zone"
							required
						/>
						<FormInput
							id="activityType"
							label="Activity type"
							as="select"
							value={form.activityType}
							onChange={handleChange}
							options={activityOptions}
						/>
						<FormInput
							id="beneficiaryCount"
							label="Beneficiaries reached"
							type="number"
							value={form.beneficiaryCount}
							onChange={handleChange}
							placeholder="120"
							min="0"
							required
						/>
						<FormInput
							id="activityDate"
							label="Activity date"
							type="date"
							value={form.activityDate}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="section-title">Monitoring and evaluation</div>
					<div className="form-grid">
						<FormInput
							id="itemsDistributed"
							label="Items distributed"
							type="number"
							value={form.itemsDistributed}
							onChange={handleChange}
							min="0"
						/>
						<FormInput
							id="trainingHours"
							label="Training hours"
							type="number"
							value={form.trainingHours}
							onChange={handleChange}
							min="0"
						/>
						<FormInput
							id="targetBeneficiaries"
							label="Target beneficiaries"
							type="number"
							value={form.targetBeneficiaries}
							onChange={handleChange}
							min="0"
						/>
						<FormInput
							id="fundsDisbursed"
							label="Funds disbursed"
							type="number"
							value={form.fundsDisbursed}
							onChange={handleChange}
							min="0"
						/>
						<FormInput
							id="satisfactionLevel"
							label="Satisfaction"
							as="select"
							value={form.satisfactionLevel}
							onChange={handleChange}
							options={satisfactionOptions}
						/>
					</div>

					<FormInput
						id="qualitativeFeedback"
						label="Qualitative feedback"
						as="textarea"
						value={form.qualitativeFeedback}
						onChange={handleChange}
						placeholder="Beneficiary story or barriers"
					/>

					<div className="section-title">Geo and compliance</div>
					<div className="form-grid">
						<FormInput
							id="geoLat"
							label="Latitude"
							value={form.geoLat}
							onChange={handleChange}
							placeholder="Auto-captured"
							readOnly
						/>
						<FormInput
							id="geoLng"
							label="Longitude"
							value={form.geoLng}
							onChange={handleChange}
							placeholder="Auto-captured"
							readOnly
						/>
						<FormInput
							id="geoAccuracy"
							label="Accuracy (m)"
							value={form.geoAccuracy}
							onChange={handleChange}
							placeholder="Auto-captured"
							readOnly
						/>
						<FormInput
							id="geoCapturedAt"
							label="Captured at"
							value={form.geoCapturedAt}
							onChange={handleChange}
							placeholder="Auto-captured"
							readOnly
						/>
					</div>

					<button
						type="button"
						className="btn btn-ghost"
						onClick={handleCaptureLocation}
					>
						Capture GPS location
					</button>
					{locationStatus && (
						<p className="subtext">{locationStatus}</p>
					)}

					<div className="form-grid">
						<FormInput
							id="staffId"
							label="Staff ID"
							value={form.staffId}
							onChange={handleChange}
							placeholder="Staff identifier"
						/>
						<FormInput
							id="staffName"
							label="Staff name"
							value={form.staffName}
							onChange={handleChange}
							placeholder="Collector name"
						/>
					</div>

					<FormInput
						id="issues"
						label="Key issues"
						value={form.issues}
						onChange={handleChange}
						placeholder="Water shortage, transport delays"
					/>
					<FormInput
						id="notes"
						label="Additional notes"
						as="textarea"
						value={form.notes}
						onChange={handleChange}
						placeholder="Add details about the visit"
					/>

					<div className="field-group">
						<label className="checkbox">
							<input
								type="checkbox"
								name="consentGiven"
								checked={form.consentGiven}
								onChange={handleChange}
								required
							/>
							<span>I confirm consent was obtained</span>
						</label>
						<label className="checkbox">
							<input
								type="checkbox"
								name="offlineStatus"
								checked={form.offlineStatus}
								onChange={handleChange}
							/>
							<span>Saved offline / pending sync</span>
						</label>
					</div>

					<div className="field-group">
						<label className="field-label" htmlFor="mediaFiles">
							Media uploads
						</label>
						<input
							key={fileInputKey}
							id="mediaFiles"
							type="file"
							multiple
							accept="image/*,video/*"
							onChange={handleFiles}
							className="file-input"
						/>
						<p className="subtext">Attach photos or short videos (max 10MB each).</p>
					</div>

					{status && (
						<div className={`notice ${status.type}`}>{status.message}</div>
					)}

					<button type="submit" className="btn btn-primary" disabled={loading}>
						{loading ? 'Submitting...' : 'Submit report'}
					</button>
				</form>
			</div>
		</section>
	)
}

export default SubmitForm
