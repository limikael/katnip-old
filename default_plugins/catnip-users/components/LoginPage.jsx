import {catnip, A, ItemList, apiFetch, ItemForm, setLocation, buildUrl} from "catnip";
import {useForm, useCounter, useApiFetch, useValueChanged} from "catnip";
import {useRef, useState} from "preact/compat";

export default function LoginPage() {
	const loginRef=useRef();
	const passwordRef=useRef();
	let [message, setMessage]=useState();
	let [session, setSession]=catnip.useSession();

	async function onLoginClick() {
		setMessage();

		try {
			let u=await catnip.apiFetch("/api/login",{
				login: loginRef.current.value,
				password: passwordRef.current.value
			});

			setSession(u);
			catnip.setLocation(session.postloginpath);
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
		<div class="d-flex flex-row align-items-center" style="width: 100%; height: 100%">
			<div class="d-flex align-items-center flex-column" style="width: 100%">
				<div class="card border shadow mb-3">
					<div class="card-body">
						<h3 class="text-center mb-4">Login</h3>

						<form>
							<input type="text" class="form-control mb-3" placeholder="Username / Email" ref={loginRef}/>
							<input type="password" class="form-control mb-3" placeholder="Password" ref={passwordRef}/>
						</form>

						{messageEl}

						<button class="btn btn-primary mt-2" style="width: 100%"
								onclick={onLoginClick}>
							Login
						</button>
					</div>
				</div>
				<A href="/signup"><b>No account? Sign Up!</b></A>
			</div>
		</div>
	);
}
