import {katnip, PromiseButton, BsAlert, useForm, delay, apiFetch, useCounter,
		useCurrentUser, setCurrentUser} from "katnip";
import {useState} from "react";

export default function IdentificationTab() {
	let user=useCurrentUser();
	let [counter,invalidate]=useCounter();
	let form=useForm({initial: {username: user.username}, deps: [counter]});
	let [message, setMessage]=useState();

	async function onUpdateClick() {
		setMessage();

		await apiFetch("/api/changeUsername",form.getCurrent());
		setMessage("Your username has been changed.");
		invalidate();
	}

	return (
		<form>
			<BsAlert message={message} ondismiss={setMessage}/>
			<div class="mb-3" >
				<label class="form-label">Username</label>
				<input type="text" class="form-control"
						{...form.field("username")}/>
			</div>
			<PromiseButton class="btn btn-primary mt-3"
					onclick={onUpdateClick}>
				Update
			</PromiseButton>
		</form>
	);
}
