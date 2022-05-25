import {useApiFetch, useTemplateContext, BootstrapAlert, useSession} from "catnip";

export default function Auth({request}) {
	let tc=useTemplateContext();
	let res=useApiFetch("/api/auth",{url: request.href});
	let [session, setSession]=useSession();

	tc.setTitle("Logging in...");

	if (res===undefined)
		return <div class="spinner-border m-3"/>;

	if (res instanceof Error)
		return <BootstrapAlert message={res}/>

	setSession(res);
	catnip.setLocation(session.postloginpath);
}
