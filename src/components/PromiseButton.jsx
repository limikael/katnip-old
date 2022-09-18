import {useState} from "react";
import {useModal} from "../utils/react-util.jsx";

function Modal({resolve, message}) {
	return (
		<div class="modal show fade" style={{display: "block", "background-color": "rgba(0,0,0,0.5)"}} aria-modal="true">
			<div class="modal-dialog modal-dialog-centered">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Error</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
								onclick={resolve}>
						</button>
					</div>
					<div class="modal-body">
						<p>{message}</p>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-primary"
								onclick={resolve}>
							Ok
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export function PromiseButton(props) {
	let [busy, setBusy]=useState(false);
	let [modal, showModal, resolveModal]=useModal();

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
			if (props.onerror)
				props.onerror(e);

			else
				showModal(<Modal resolve={resolveModal} message={e.message}/>);
		}

		setBusy(false);
	}

	let propsCopy={...props};
	propsCopy.disabled=busy;
	propsCopy.onclick=null;

	return (<>
		{modal}
		<button  {...propsCopy} onclick={onClick}>
			{busy &&
				<span class="spinner-border spinner-border-sm me-2"/>
			}
			{propsCopy.children}
		</button>
	</>);
} 