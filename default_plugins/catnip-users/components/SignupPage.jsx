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
		<div class="d-flex flex-row align-items-center" style="width: 100%; height: 100%">
			<div class="d-flex align-items-center flex-column" style="width: 100%">
				<div class="card border shadow mb-3">
					<div class="card-body">
						<h3 class="text-center mb-4">Sign Up</h3>

						<form>
							<input type="text" class="form-control mb-3" placeholder="Username / Email"
									{...field("login")}/>
							<input type="password" class="form-control mb-3" placeholder="Password"
									{...field("password")}/>
							<input type="password" class="form-control mb-3" placeholder="Repeat Password" 
									{...field("repeatPassword")}/>
						</form>

						{messageEl}

						<PromiseButton class="btn btn-primary mt-2" style="width: 100%"
								action={onSignupClick}
								onerror={setMessage}>
							Sign Up
						</PromiseButton>
					</div>
				</div>
				<A href="/login"><b>Already have an account? Login instead.</b></A>
			</div>
		</div>
	);
}
