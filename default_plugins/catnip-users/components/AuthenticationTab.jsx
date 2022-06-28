import {catnip, PromiseButton, BootstrapAlert, useForm, delay, apiFetch, useCounter,
		useCurrentUser, setCurrentUser, useApiFetch, A} from "catnip";
import {useState} from "preact/compat";

export default function AuthenticationTab() {
	let user=useCurrentUser();
	let authMethods=useApiFetch("/api/authMethodStatus");

	if (authMethods===undefined)
		return <div class="spinner-border m-3"/>;

	let items=[];
	for (let authMethod of authMethods) {
		//console.log(authMethod);

		if (authMethod.token) {
			items.push(
				<div>
					<A class="btn btn-danger my-2" href={authMethod.href}>
						<b>Unlink {authMethod.title}</b>
					</A>
				</div>
			);
		}

		else {
			items.push(
				<div>
					<A class="btn btn-danger my-2" href={authMethod.href}>
						<b>Link {authMethod.title}</b>
					</A>
				</div>
			);
		}
	}

	return (<>
		{items}
	</>);
}
