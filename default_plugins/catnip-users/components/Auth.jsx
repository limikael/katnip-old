import {useApiFetch, useTemplateContext, BootstrapAlert, useChannel} from "catnip";

export default function Auth({request}) {
	let tc=useTemplateContext();
	let res=useApiFetch("/api/auth",{url: request.href});
	let postloginpath=useChannel("postloginpath");

	tc.setTitle("Logging in...");

	if (res===undefined)
		return <div class="spinner-border m-3"/>;

	if (res instanceof Error)
		return <BootstrapAlert message={res}/>

	catnip.setCurrentUser(res.user);
	catnip.setLocation(postloginpath);
}
