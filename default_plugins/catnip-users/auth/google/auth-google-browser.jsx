import {catnip, useApiFetch, useTemplateContext, BootstrapAlert, useChannel, useCurrentUser} from "catnip";
import {useMemo} from "react";

export default function GoogleAuth({request}) {
	let tc=useTemplateContext();
	let newUser=useApiFetch("/api/googleAuth",{url: request.href});
	let postloginpath=useChannel("postloginpath");
	let user=useCurrentUser();
	let linking=useMemo(()=>{
		return !!user;
	},[]);

	if (linking)
		tc.setTitle("Linking Google account...");

	else
		tc.setTitle("Logging in with Google...");

	if (newUser===undefined)
		return <div class="spinner-border m-3"/>;

	if (newUser instanceof Error)
		return <BootstrapAlert message={newUser}/>

	catnip.setCurrentUser(newUser);
	if (linking)
		catnip.setLocation("/account");

	else
		catnip.setLocation(postloginpath);
}

catnip.addRoute("googleAuth",GoogleAuth);
