import {useState} from "preact/compat";
import {BootstrapAlert} from "../utils/bs-util.jsx";

export function PromiseButton(props) {
	let [busy, setBusy]=useState(false);
	let [message, setMessage]=useState(false);

	async function onClick(ev) {
		ev.preventDefault();

		setBusy(true);
		setMessage(null);

		try {
			if (props.action)
				await props.action();

			if (props.onclick)
				await props.onclick();
		}

		catch (e) {
			if (props.onerror)
				props.onerror(e);

			else
				setMessage(e);
		}

		setBusy(false);
	}

	let propsCopy={...props};
	propsCopy.disabled=busy;
	propsCopy.onclick=null;

	return (<>
		{message &&
			<BootstrapAlert message={message} class="mb-3" ondismiss={setMessage}/>
		}
		<button  {...propsCopy} onclick={onClick}>
			{busy &&
				<span class="spinner-border spinner-border-sm me-2"/>
			}
			{propsCopy.children}
		</button>
	</>);
} 