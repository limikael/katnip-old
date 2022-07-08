import {catnip, A, ItemList, apiFetch, ItemForm, setLocation, buildUrl,
		useForm, useCounter, useApiFetch, useValueChanged, PromiseButton,
		setCurrentUser, useChannel, useTemplateContext} from "catnip";
import {useRef, useState} from "preact/compat";

export default function LinkEmailPage(props) {
	let [formValues, field]=useForm();
	let [message, setMessage]=useState();
	let tc=useTemplateContext();

	tc.setTitle("Link Email And Password");

	async function onSignupClick() {
		setMessage();

		let u=await catnip.apiFetch("/api/signup",formValues);

		setCurrentUser(u);
		catnip.setLocation("/account");
	}

	return (
		<div style="width: 20rem" class="mx-auto">
			<div class="card border shadow mb-4">
				<div class="card-body">
					<form class="mb-2">
						<input type="text" class="form-control mb-3" placeholder="Username / Email"
								{...field("email")}/>
						<input type="password" class="form-control mb-3" placeholder="Password"
								{...field("password")}/>
						<input type="password" class="form-control" placeholder="Repeat Password" 
								{...field("repeatPassword")}/>
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