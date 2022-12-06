import {useState, useRef} from "react";
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

/**
 * A button with an async onclick handler.
 *
 * The Button component works like the standard HTML button tag.
 * The difference is that it can have a busy state, in which case a spinner
 * will be shown inside the button. The busy state applies while the Promise
 * returned from the onclick handler is unresolved. If the Promise rejects,
 * the function specified in the onerror prop will be called. If no such
 * function is registered, a modal will be shown with the message
 * from the Error produced by the Promise.
 *
 * @component React Components.PromiseButton
 * @param onclick:Function The function to call when the button is clicked.
 *                         This function can be a async.
 * @param onerror:Function The function to call if the Promise rejects.
 */
export function PromiseButton(props) {
	let [busy, setBusy]=useState(false);
	let [modal, showModal, resolveModal]=useModal();
	let fileInputRef=useRef();

	async function onClick(ev) {
		ev.preventDefault();

		if (props.onfileselect) {
			fileInputRef.current.value="";
			fileInputRef.current.click();
			return;
		}

		setBusy(true);

		try {
			if (props.action)
				await props.action();

			if (props.onclick)
				await props.onclick(ev);
		}

		catch (e) {
			if (props.onerror)
				props.onerror(e);

			else
				showModal(<Modal resolve={resolveModal} message={e.message}/>);
		}

		setBusy(false);
	}

	async function onUploadChange(ev) {
		ev.preventDefault();

		setBusy(true);
		try {
			await props.onfileselect(fileInputRef.current.files);
		}

		catch (e) {
			if (props.onerror)
				props.onerror(e);

			else
				showModal(<Modal resolve={resolveModal} message={e.message}/>);
		}
		fileInputRef.current.value="";
		setBusy(false);
	}

	let propsCopy={...props};
	propsCopy.disabled=busy;
	propsCopy.onclick=null;

	let fileInput;
	if (props.onfileselect)
		fileInput=<input type="file" ref={fileInputRef} style="display: none" onchange={onUploadChange} />

	return (<>
		{modal}
		<button  {...propsCopy} onclick={onClick}>
			{busy &&
				<span class="spinner-border spinner-border-sm me-2"/>
			}
			{propsCopy.children}
		</button>
		{fileInput}
	</>);
} 