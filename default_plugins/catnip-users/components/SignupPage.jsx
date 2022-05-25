import {catnip, A, ItemList, apiFetch, ItemForm, setLocation, buildUrl} from "catnip";
import {useForm, useCounter, useApiFetch, useValueChanged, PromiseButton} from "catnip";
import {useRef, useState} from "preact/compat";

export default function SignupPage() {
	let [formValues, field]=useForm();
	let [message, setMessage]=useState();
	let [session, setSession]=catnip.useSession();

	async function onSignupClick() {
		setMessage();

		let u=await catnip.apiFetch("/api/signup",formValues);

		setSession(u);
		catnip.setLocation(session.postloginpath);
	}

	let messageEl;
	if (message)
		messageEl=(
			<div class="text-danger text-center"><b>{message.message}</b></div>
		);

	return (
		<div class="mt-5 ms-auto me-auto" style="width: 100%; max-width: 20rem">
			<div class="card border shadow mb-4">
				<div class="card-body">
					<h3 class="text-center mb-3">Sign Up</h3>

					<form class="mb-2">
						<input type="text" class="form-control mb-3" placeholder="Username / Email"
								{...field("login")}/>
						<input type="password" class="form-control mb-3" placeholder="Password"
								{...field("password")}/>
						<input type="password" class="form-control" placeholder="Repeat Password" 
								{...field("repeatPassword")}/>
					</form>

					{messageEl}

					<PromiseButton class="btn btn-primary mt-2 mb-2" style="width: 100%"
							action={onSignupClick}
							onerror={setMessage}>
						Sign Up
					</PromiseButton>
					<A href="/login" class="d-block small text-muted text-center" style="width: 100%">
						<b>Already have an account? Login instead.</b>
					</A>
				</div>
			</div>
			{session.googleAuthUrl &&
				<a class="btn btn-danger mb-2" style="width: 100%" href={session.googleAuthUrl}>
					<b>Sign in with Google</b>
				</a>
			}
		</div>
	);
}
