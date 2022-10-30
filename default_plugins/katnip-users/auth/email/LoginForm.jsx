import {katnip, A, ItemList, apiFetch, setLocation, buildUrl, useChannel, delay,
		useForm, useCounter, useApiFetch, useValueChanged, PromiseButton} from "katnip";
import {useRef, useState} from "preact/compat";

export default function LoginForm(props) {
	const loginRef=useRef();
	const passwordRef=useRef();
	let [message, setMessage]=useState();
	let postloginpath=useChannel("postloginpath");

	async function onLoginClick() {
		setMessage();

		let res=await katnip.apiFetch("/api/login",{
			login: loginRef.current.value,
			password: passwordRef.current.value
		});

		katnip.setLocation(postloginpath);
	}

	let messageEl;
	if (message)
		messageEl=(
			<div class="text-danger text-center"><b>{message.message}</b></div>
		);

	return (
		<div class="card border shadow mb-4">
			<div class="card-body">
				<h3 class="text-center mb-3">Login</h3>

				<form class="mb-2">
					<input type="text" class="form-control mb-3" placeholder="Username / Email" ref={loginRef}/>
					<input type="password" class="form-control" placeholder="Password" ref={passwordRef}/>
				</form>

				{messageEl}

				<PromiseButton class="btn btn-primary mb-2 mt-2" style="width: 100%"
						onclick={onLoginClick}
						onerror={setMessage}>
					Login
				</PromiseButton>
				<a href="#" class="d-block small text-muted text-center" style="width: 100%"
						onclick={props.onswitchmode}>
					<b>No account? Sign Up!</b>
				</a>
			</div>
		</div>
	);
}
