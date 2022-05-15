export function BootstrapAlert({message, ondismiss}) {
	let alertClass="alert-success";

	function onCloseClick() {
		ondismiss();
	}

	if (message instanceof Error) {
		message=message.message;
		alertClass="alert-danger";
	}

	if (!message || message=="")
		return;

	return (
		<div class="mb-2">
			<div class={`alert alert-dismissible ${alertClass}`}>
				<button type="button" class="btn-close"
						onclick={onCloseClick}></button>
				{message}
			</div>
		</div>
	);
}

export function BsInput({...props}) {
	if (props.type=="textarea")
		return (
			<textarea class="form-control" {...props}>{props.value}</textarea>
		);

	if (props.type=="select") {
		let options=null;
		if (props.options)
			options=optionsFromObject(props.options);

		return (
			<select class="form-select" {...props}>
				{options}
				{props.children}
			</select>
		);
	}

	return (
		<input class="form-control" {...props} />
	);

}

export function BsGroupInput({title, ...props}) {
	return (
		<div class="form-group row mb-3">
			<label class="col-4 col-form-label">{title}</label>
			<div class="col-8">
				<BsInput {...props}/>
			</div>
		</div>
	);
}
