import {optionsFromObject, usePromise} from "./react-util.jsx";

export function BsAlert({message, ondismiss}) {
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
				{ondismiss &&
					<button type="button" class="btn-close"
						onclick={onCloseClick}></button>
				}
				{message}
			</div>
		</div>
	);
}

export function BsInput({...props}) {
	let options=usePromise(props.options,[props.options]);

	if (!props.class)
		props.class="";

	if (props.type=="textarea") {
		props.class+=" form-control";
		return (
			<textarea {...props}>{props.value}</textarea>
		);
	}

	if (props.type=="select") {
		let optionElements=null;

		if (options)
			optionElements=optionsFromObject(options);

		props.class+=" form-select";

		if (!props.value)
			delete props.value;

		return (
			<select class="form-select" {...props}>
				{optionElements}
				{props.children}
			</select>
		);
	}

	props.class+=" form-control";
	return (
		<input {...props} />
	);

}

export function BsGroupInput({title, ...props}) {
	return (
		<div class="form-group row mb-3">
			<label class="col-12 col-sm-4 col-form-label">{title}</label>
			<div class="col-12 col-sm-8">
				<BsInput {...props}/>
				{props.description &&
					<small class="form-text text-muted">
						{props.description}
					</small>
				}
			</div>
		</div>
	);
}

export function bsLoader(content, fn) {
	if (content===undefined)
		return <div class="spinner-border m-3"/>;

	if (content instanceof Error)
		return <BsAlert message={content}/>;

	return fn();
}
