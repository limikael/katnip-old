import {katnip, A, ItemList, apiFetch, setLocation, buildUrl,
		useForm, useCounter, useApiFetch, useValueChanged, PromiseButton,
		setCurrentUser, useChannel, useTemplateContext} from "katnip";
import {useRef, useState} from "preact/compat";

export default function LinkEmailPage(props) {
	let form=useForm({initial: {}});
	let [message, setMessage]=useState();
	let tc=useTemplateContext();

	tc.setTitle("Link Email And Password");

	async function onSignupClick() {
		setMessage();

		let u=await katnip.apiFetch("/api/signup",form.getCurrent());

		setCurrentUser(u);
		katnip.setLocation("/account");
	}

	return (
		<div style="width: 20rem" class="mx-auto">
			<div class="card border shadow mb-4">
				<div class="card-body">
					<form class="mb-2">
						<input type="text" class="form-control mb-3" placeholder="Username / Email"
								{...form.field("email")}/>
						<input type="password" class="form-control mb-3" placeholder="Password"
								{...form.field("password")}/>
						<input type="password" class="form-control" placeholder="Repeat Password" 
								{...form.field("repeatPassword")}/>
					</form>

					{message &&
						<div class="text-danger text-center"><b>{message.message}</b></div>
					}

					<PromiseButton class="btn btn-primary mt-2 mb-2" style="width: 100%"
							onclick={onSignupClick}
							onerror={setMessage}>
						Link Email And Password
					</PromiseButton>
				</div>
			</div>
		</div>
	);
}
