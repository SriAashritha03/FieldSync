const Loading = ({ label = 'Loading' }) => {
	return (
		<div className="loading">
			<div className="spinner" aria-hidden="true" />
			<span>{label}...</span>
		</div>
	)
}

export default Loading
