import {katnip, A, ItemList, apiFetch, setLocation, buildUrl,
		useForm, useCounter, useApiFetch, useValueChanged, PromiseButton,
		setCurrentUser, useChannel} from "katnip";
import {useRef, useState} from "preact/compat";

export default function SignupForm(props) {
	let form=useForm({initial: {}});
	let [message, setMessage]=useState();
	let postloginpath=useChannel("postloginpath");

	async function onSignupClick() {
		setMessage();

		let u=await katnip.apiFetch("/api/signup",form.getCurrent());

		setCurrentUser(u);
		katnip.setLocation(postloginpath);
	}

	let messageEl;
	if (message)
		messageEl=(
			<div class="text-danger text-center"><b>{message.message}</b></div>
		);

	let loginPageItems=[];
	katnip.doAction("loginPageItems",loginPageItems);

	return (
		<div class="card border shadow mb-4">
			<div class="card-body">
				<h3 class="text-center mb-3">Sign Up</h3>

				<form class="mb-2">
					<input type="text" class="form-control mb-3" placeholder="Username / Email"
							{...form.field("email")}/>
					<input type="password" class="form-control mb-3" placeholder="Password"
							{...form.field("password")}/>
					<input type="password" class="form-control" placeholder="Repeat Password" 
							{...form.field("repeatPassword")}/>
				</form>

				{messageEl}

				<PromiseButton class="btn btn-primary mt-2 mb-2" style="width: 100%"
						action={onSignupClick}
						onerror={setMessage}>
					Sign Up
				</PromiseButton>
				<a href="#" class="d-block small text-muted text-center" style="width: 100%"
						onclick={props.onswitchmode}>
					<b>Already have an account? Login instead.</b>
				</a>
			</div>
		</div>
	);
}
