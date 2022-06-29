import {catnip, A} from "catnip";

export default function LoginPage() {
	let user=catnip.useCurrentUser();
	let authMethods=catnip.useChannel("authMethods");

	if (user) {
		catnip.setLocation("/account");
		return;
	}

	let items=[];
	authMethods.sort((a,b)=>a.priority-b.priority);
	for (authMethod of authMethods) {
		if (authMethod.element) {
			let Element=catnip.elements[authMethod.element];
			items.push(<Element/>);
		}

		else {
			items.push(
				<A class="btn btn-danger mb-3" style="width: 100%" href={authMethod.href}>
					<b>Login With {authMethod.title}</b>
				</A>
			);
		}
	}

	return (
		<div style="max-width: 20rem; margin-left: auto; margin-right: auto" class="mt-5">
			{items}
		</div>
	);
}