export function BootstrapAlert({message, ondismiss}) {
	let alertClass="alert-success";

	if (message instanceof Error) {
		message=message.message;
		alertClass="alert-danger";
	}

	if (!message)
		return;

	return (
		<div class="mb-2">
			<div class={`alert alert-dismissible ${alertClass}`}>
				<button type="button" class="btn-close"
						onclick={ondismiss}></button>
				{message}
			</div>
		</div>
	);
}