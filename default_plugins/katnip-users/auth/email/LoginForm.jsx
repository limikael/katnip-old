import {katnip, A, ItemList, quest, setLocation, buildUrl, useChannel,
		useForm, useCounter, useQuest, useValueChanged} from "katnip";
import {useRef, useState} from "preact/compat";

export default function LoginForm(props) {
	const emailRef=useRef();
	const passwordRef=useRef();
	let [message, setMessage]=useState();
	let postloginpath=useChannel("postloginpath");

	async function onLoginClick() {
		setMessage();

		try {
			let user=await katnip.quest("/api/login",{query: {
				email: emailRef.current.value,
				password: passwordRef.current.value
			}});

			katnip.setCurrentUser(user);
			katnip.setLocation(postloginpath);
		}

		catch (e) {
			setMessage(e.message);
		}
	}

	let messageEl;
	if (message)
		messageEl=(
			<div class="text-danger text-center"><b>{message}</b></div>
		);

	return (
		<div class="card border shadow mb-4">
			<div class="card-body">
				<h3 class="text-center mb-3">Login</h3>

				<form class="mb-2">
					<input type="text" class="form-control mb-3" placeholder="Username / Email" ref={emailRef}/>
					<input type="password" class="form-control" placeholder="Password" ref={passwordRef}/>
				</form>

				{messageEl}

				<button class="btn btn-primary mb-2 mt-2" style="width: 100%"
						onclick={onLoginClick}>
					Login
				</button>
				<a href="#" class="d-block small text-muted text-center" style="width: 100%"
						onclick={props.onswitchmode}>
					<b>No account? Sign Up!</b>
				</a>
			</div>
		</div>
	);
}
