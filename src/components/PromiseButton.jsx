import {useState} from "preact/compat";

export function PromiseButton(props) {
	let [busy, setBusy]=useState(false);

	async function onClick(ev) {
		ev.preventDefault();

		setBusy(true);
		try {
			if (props.action)
				await props.action();

			if (props.onclick)
				await props.onclick();
		}

		catch (e) {
			props.onerror(e);
		}

		setBusy(false);
	}

	let propsCopy={...props};
	propsCopy.disabled=busy;
	propsCopy.onclick=null;

	return (
		<button  {...propsCopy} onclick={onClick}>
			{busy &&
				<span class="spinner-border spinner-border-sm me-2"/>
			}
			{propsCopy.children}
		</button>
	);
} 