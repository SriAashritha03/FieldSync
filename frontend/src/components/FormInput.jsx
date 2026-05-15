const FormInput = ({
	id,
	label,
	type = 'text',
	value,
	onChange,
	placeholder,
	required = false,
	as = 'input',
	options = [],
	...rest
}) => {
	const sharedProps = {
		id,
		name: id,
		value,
		onChange,
		placeholder,
		required,
		className: 'input',
		...rest,
	}

	return (
		<div className="form-field">
			<label htmlFor={id}>{label}</label>
			{as === 'textarea' ? (
				<textarea {...sharedProps} rows={4} className="textarea" />
			) : as === 'select' ? (
				<select {...sharedProps} className="select">
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			) : (
				<input {...sharedProps} type={type} />
			)}
		</div>
	)
}

export default FormInput
