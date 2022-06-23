import {catnip, delay, buildUrl, apiFetch} from "catnip";
import ClientOAuth2 from "client-oauth2";

function createGoogleAuthClient(origin) {
	return new ClientOAuth2({
		clientId: catnip.getSetting("googleClientId"),
		clientSecret: catnip.getSetting("googleClientSecret"),
		accessTokenUri: 'https://oauth2.googleapis.com/token',
		authorizationUri: 'https://accounts.google.com/o/oauth2/auth',
		redirectUri: origin+'/googleAuth',
		scopes: ['https://www.googleapis.com/auth/userinfo.email']
	});
}

catnip.addSetting("authGoogleEnable",{
	title: "Login with Google", 
	category: "auth", 
	type: "select",
	session: true,
	options: {
		false: "Disabled", 
		true: "Enabled"
	}
});

catnip.addSetting("googleClientId",{
	title: "Google Client Id",
	category: "auth",
	condition: {
		authGoogleEnable: true
	}
});

catnip.addSetting("googleClientSecret",{
	title: "Google Client Secret",
	category: "auth",
	condition: {
		authGoogleEnable: true
	}
});

catnip.addAction("initChannels",(channelIds, req)=>{
	if (catnip.getSetting("googleClientId") &&
			catnip.getSetting("googleClientSecret"))
		channelIds.push("googleAuthUrl");
});

catnip.addChannel("googleAuthUrl",({}, req)=>{
	return createGoogleAuthClient(req.origin).code.getUri();
});

catnip.addApi("/api/googleAuth",async ({url}, req)=>{
	let res=await createGoogleAuthClient(req.origin).code.getToken(url);

	let googleApiUrl=buildUrl("https://oauth2.googleapis.com/tokeninfo",{
		id_token: res.data.id_token
	});

	let tokenInfo=await apiFetch(googleApiUrl);
	if (!tokenInfo.email)
		throw new Error("Unable to login with google");

	let user=await catnip.db.User.findOne({email: tokenInfo.email});
	if (!user) {
		user=new catnip.db.User();
		user.email=tokenInfo.email;
		user.role="user";
		await user.save();
	}

	await catnip.setSessionValue(req.sessionId,user.id);

	return user;
});
