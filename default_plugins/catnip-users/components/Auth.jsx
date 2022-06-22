import {useApiFetch, useTemplateContext, BootstrapAlert, useChannel} from "catnip";

export default function Auth({request}) {
	let tc=useTemplateContext();
	let user=useApiFetch("/api/auth",{url: request.href});
	let postloginpath=useChannel("postloginpath");

	tc.setTitle("Logging in...");

	if (user===undefined)
		return <div class="spinner-border m-3"/>;

	if (user instanceof Error)
		return <BootstrapAlert message={user}/>

	catnip.setCurrentUser(user);
	catnip.setLocation(postloginpath);
}
