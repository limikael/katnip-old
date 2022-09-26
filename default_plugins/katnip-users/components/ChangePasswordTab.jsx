import {katnip, PromiseButton, BsAlert, useForm, delay, quest, useCounter} from "katnip";
import {useState} from "react";

export default function ChangePasswordTab() {
	let [counter, invalidate]=useCounter();
	let form=useForm({imitial: {}, deps: [counter]});
	let [message, setMessage]=useState();

	async function onChangePasswordClick() {
		setMessage();
		await quest("/api/changePassword",{query: form.getCurrent()});
		setMessage("Your password has been changed.");
		invalidate();
	}

	return (
		<form>
			<BsAlert message={message} ondismiss={setMessage}/>
			<div class="mb-3" >
				<label class="form-label">Old Password</label>
				<input type="password" class="form-control"
						{...form.field("oldPassword")}/>
			</div>
			<div class="mb-3" >
				<label class="form-label">New Password</label>
				<input type="password" class="form-control"
					{...form.field("newPassword")}/>
			</div>
			<div class="mb-3" >
				<label class="form-label">Repeat New Password</label>
				<input type="password" class="form-control"
					{...form.field("repeatNewPassword")}/>
			</div>
			<PromiseButton class="btn btn-primary mt-3"
					onclick={onChangePasswordClick}
					onerror={setMessage}>
				Change Password
			</PromiseButton>
		</form>
	);
}
