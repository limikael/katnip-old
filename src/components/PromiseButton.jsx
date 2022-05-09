import {useState} from "preact/compat";

export function PromiseButton(props) {
	let [busy, setBusy]=useState(false);

	async function onClick() {
		setBusy(true);
		try {
			await props.action();
		}

		catch (e) {
			props.onerror(e);
		}

		setBusy(false);
	}

	props.disabled=busy;

	return (
		<button {...props}
				onclick={onClick}>
			{busy &&
				<span class="spinner-border spinner-border-sm me-2"/>
			}
			{props.children}
		</button>
	);
} 