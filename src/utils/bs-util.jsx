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