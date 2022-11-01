import {katnip, A, ItemList, apiFetch, setLocation, buildUrl,
		useForm, useCounter, useApiFetch, useValueChanged, PromiseButton,
		useChannel} from "katnip";
import {useRef, useState} from "preact/compat";

export default function SignupForm(props) {
	let form=useForm({initial: {}, class: "form-control"});
	let [message, setMessage]=useState();
	let postloginpath=useChannel("postloginpath");

	async function onSignupClick() {
		try {
			setMessage();
			await katnip.apiFetch("/api/signup",form.getCurrent());
			katnip.setLocation(postloginpath);
		}

		catch (e) {
			setMessage(e);
			form.setError(e);
		}
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
					<input type="text" placeholder="Email" {...form.field("email","mb-3")}/>
					<input type="password" placeholder="Password" {...form.field("password","mb-3")}/>
					<input type="password" placeholder="Repeat Password" {...form.field("repeatPassword")}/>
				</form>

				{messageEl}

				<PromiseButton class="btn btn-primary mt-2 mb-2" style="width: 100%"
						action={onSignupClick}>
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
