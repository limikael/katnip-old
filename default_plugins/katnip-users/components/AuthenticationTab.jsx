import {katnip, PromiseButton, useForm, delay, apiFetch,
		useCurrentUser, setCurrentUser, useApiFetch, A, bindArgs,
		useCounter, useForceUpdate, useModal, setLocation} from "katnip";
import {useState, useRef} from "preact/compat";

function DeleteAccountModal({resolve}) {
	return (
		<div class="modal show fade" style={{display: "block", "background-color": "rgba(0,0,0,0.5)"}} aria-modal="true">
			<div class="modal-dialog modal-dialog-centered">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Confirm</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
								onclick={bindArgs(resolve,false)}>
						</button>
					</div>
					<div class="modal-body">
						<p>Are you absolutely sure you want to delete your account?</p>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
								onclick={bindArgs(resolve,false)}>
							Cancel
						</button>
						<button type="button" class="btn btn-danger"
								onclick={bindArgs(resolve,true)}>
							Delete
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function AuthenticationTab() {
	let [counter, invalidate]=useCounter();
	let user=useCurrentUser();
	let authMethods=useApiFetch("/api/authMethodStatus",{},[counter]);
	let [modal, showModal, resolveModal]=useModal();

	if (authMethods===undefined)
		return <div class="spinner-border m-3"/>;

	async function onUnlinkClick(methodId) {
		await apiFetch("/api/unlinkAuthMethod",{methodId});
		invalidate();
	}

	let items=[];
	for (let authMethod of authMethods) {
		//console.log(authMethod);

		if (authMethod.active) {
			items.push(
				<div>
					<PromiseButton class="btn btn-primary my-2"
							onclick={bindArgs(onUnlinkClick,authMethod.id)}>
						Unlink {authMethod.title}
					</PromiseButton>
				</div>
			);
		}

		else {
			items.push(
				<div>
					<A class="btn btn-primary my-2" href={authMethod.href}>
						Link {authMethod.title}
					</A>
				</div>
			);
		}
	}

	async function onDeleteClick() {
		let res=await showModal(<DeleteAccountModal resolve={resolveModal}/>);
		if (res) {
			await apiFetch("/api/deleteAccount");
			setLocation();
		}
	}

	return (<>
		{modal}
		{items}
		<hr/>
		<PromiseButton class="btn btn-danger my-2" onclick={onDeleteClick}>
			Delete Account
		</PromiseButton>
	</>);
}
