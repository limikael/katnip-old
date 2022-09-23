import {katnip, PromiseButton, BsAlert, useForm, delay, apiFetch, useCounter} from "katnip";
import {useState} from "react";

export default function ChangePasswordTab() {
	let [counter, invalidate]=useCounter();
	let [values, field]=useForm({},[counter]);
	let [message, setMessage]=useState();

	async function onChangePasswordClick() {
		setMessage();
		await apiFetch("/api/changePassword",values);
		setMessage("Your password has been changed.");
		invalidate();
	}

	return (
		<form>
			<BsAlert message={message} ondismiss={setMessage}/>
			<div class="mb-3" >
				<label class="form-label">Old Password</label>
				<input type="password" class="form-control"
						{...field("oldPassword")}/>
			</div>
			<div class="mb-3" >
				<label class="form-label">New Password</label>
				<input type="password" class="form-control"
					{...field("newPassword")}/>
			</div>
			<div class="mb-3" >
				<label class="form-label">Repeat New Password</label>
				<input type="password" class="form-control"
					{...field("repeatNewPassword")}/>
			</div>
			<PromiseButton class="btn btn-primary mt-3"
					onclick={onChangePasswordClick}
					onerror={setMessage}>
				Change Password
			</PromiseButton>
		</form>
	);
}
