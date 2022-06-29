import {catnip, PromiseButton, BootstrapAlert, useForm, delay, apiFetch,
		useCurrentUser, setCurrentUser, useApiFetch, A, bindArgs,
		useCounter} from "catnip";
import {useState} from "preact/compat";

export default function AuthenticationTab() {
	let [counter, invalidate]=useCounter();
	let user=useCurrentUser();
	let authMethods=useApiFetch("/api/authMethodStatus",{},[counter]);

	if (authMethods===undefined)
		return <div class="spinner-border m-3"/>;

	async function onUnlinkClick(methodId) {
		let user=await apiFetch("/api/unlinkAuthMethod",{methodId});

		catnip.setCurrentUser(user);
		invalidate();
	}

	let items=[];
	for (let authMethod of authMethods) {
		//console.log(authMethod);

		if (authMethod.token) {
			items.push(
				<div>
					<PromiseButton class="btn btn-primary my-2"
							onclick={bindArgs(onUnlinkClick,authMethod.id)}>
						Unlink {authMethod.title}
					</PromiseButton>
				</div>
			);
		}

		else {
			items.push(
				<div>
					<A class="btn btn-primary my-2" href={authMethod.href}>
						Link {authMethod.title}
					</A>
				</div>
			);
		}
	}

	return (<>
		{items}
		<hr/>
		<PromiseButton class="btn btn-danger my-2">
			Delete Account
		</PromiseButton>
	</>);
}
