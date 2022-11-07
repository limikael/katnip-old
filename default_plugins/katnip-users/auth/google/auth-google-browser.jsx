import {katnip, useApiFetch, setTemplateContext, BsAlert, useChannel, useCurrentUser} from "katnip";
import {useMemo} from "react";

export default function GoogleAuth({request, renderMode}) {
	if (renderMode=="ssr")
		return;

	let apiRes=useApiFetch("/api/googleAuth",{url: request.href});
	let postloginpath=useChannel("postloginpath");
	let user=useCurrentUser();
	let linking=useMemo(()=>{
		return !!user;
	},[]);

	if (linking)
		setTemplateContext({title: "Linking Google account..."});

	else
		setTemplateContext({title: "Logging in with Google..."});

	if (apiRes instanceof Error)
		return <BsAlert message={apiRes}/>

	if (!user)
		return <div class="spinner-border m-3"/>;

	if (linking)
		katnip.setLocation("/account");

	else
		katnip.setLocation(postloginpath);
}

katnip.addRoute("googleAuth",GoogleAuth);
