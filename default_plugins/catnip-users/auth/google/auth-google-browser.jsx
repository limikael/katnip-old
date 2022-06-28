import {catnip, useApiFetch, useTemplateContext, BootstrapAlert, useChannel} from "catnip";

export default function GoogleAuth({request}) {
	let tc=useTemplateContext();
	let user=useApiFetch("/api/googleAuth",{url: request.href});
	let postloginpath=useChannel("postloginpath");

	tc.setTitle("Logging in...");

	if (user===undefined)
		return <div class="spinner-border m-3"/>;

	if (user instanceof Error)
		return <BootstrapAlert message={user}/>

	catnip.setCurrentUser(user);
	catnip.setLocation(postloginpath);
}

catnip.addRoute("googleAuth",GoogleAuth);

/*function GoogleLoginButton() {
	let authGoogleEnable=(String(useChannel("authGoogleEnable"))=="true");
	let googleAuthUrl=useChannel("googleAuthUrl");

	if (!googleAuthUrl || !authGoogleEnable)
		return;

	return (
		<a class="btn btn-danger mb-3" style="width: 100%" href={googleAuthUrl}>
			<b>Sign in with Google</b>
		</a>
	);
}

catnip.addAction("loginPageItems",(items)=>{
	items.push(<GoogleLoginButton/>);
});*/