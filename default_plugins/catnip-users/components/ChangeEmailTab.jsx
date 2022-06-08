import {catnip, PromiseButton, BootstrapAlert, useForm, delay, apiFetch, useCounter,
		useCurrentUser, setCurrentUser} from "catnip";
import {useState} from "preact/compat";

export default function ChangeEmailTab() {
	let user=useCurrentUser();
	let [counter, invalidate]=useCounter();
	let [values, field]=useForm({email: user.email},[counter]);
	let [message, setMessage]=useState();

	async function onChangeEmailClick() {
		setMessage();
		let newEmail=values.email;
		await apiFetch("/api/changeEmail",values);
		setMessage("Your email has been changed.");

		user.email=newEmail;
		setCurrentUser(user);
		invalidate();
	}

	return (
		<form>
			<BootstrapAlert message={message} ondismiss={setMessage}/>
			<div class="mb-3" >
				<label class="form-label">New Email</label>
				<input type="text" class="form-control"
						{...field("email")}/>
			</div>
			<div class="mb-3" >
				<label class="form-label">Password</label>
				<input type="password" class="form-control"
					{...field("password")}/>
			</div>
			<PromiseButton class="btn btn-primary mt-3"
					onclick={onChangeEmailClick}
					onerror={setMessage}>
				Change Email
			</PromiseButton>
		</form>
	);
}
