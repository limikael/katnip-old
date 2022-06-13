import {useTemplateContext, PromiseButton, apiFetch, useForm} from "catnip";

export default function SessionTokenPage({request}) {
	let [values, field]=useForm();
	let tc=useTemplateContext();
	tc.setTitle("Session Token");

	async function onUseTokenClick() {
		await apiFetch("/api/hello");
	}

	async function onRestoreSessionClick() {
		await apiFetch("/api/restoreToken",{token: values.token});
	}

	return <>
		<div style="max-width: 40rem">
			<p>
				This is your session token. It will be stored in a cookie in this browser. Save it permanently before continuing,
				so that you can use it to log in from another browser.
			</p>
			<div class="card bg-light mb-3">
				<div class="card-body font-monospace">
					<b>Hello world.</b>
				</div>
			</div>
			<p>
				<PromiseButton class="btn btn-primary" onclick={onUseTokenClick}>
					Use This Token
				</PromiseButton>
			</p>

			<h2 class="mt-5">Restore Session</h2>
			<p>
				If you have a session token from another device or browser, you can restore the
				previous session here.
			</p>
			<form class="mb-2">
				<input type="text" class="form-control mb-3" placeholder="Session Token" {...field("token")}/>
			</form>
			<p>
				<PromiseButton class="btn btn-primary" onclick={onRestoreSessionClick}>
					Restore Session
				</PromiseButton>
			</p>
		</div>
	</>;
}