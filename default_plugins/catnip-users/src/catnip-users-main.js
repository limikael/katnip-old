import {catnip, delay, buildUrl, apiFetch} from "catnip";
import User from "./User.js";
import {getCapsByRole} from "./rolecaps.js";
import {createGoogleAuthClient} from "./auth.js";
import "./catnip-users-api.js";

catnip.addModel(User);

catnip.addSetting("install");

catnip.addSettingCategory("auth",{title: "Authorization", priority: 15});
catnip.addSetting("googleClientId",{title: "Google Client Id", category: "auth"});
catnip.addSetting("googleClientSecret",{title: "Google Client Secret", category: "auth"});

catnip.addAction("getClientSession",async (clientSession, sessionRequest)=>{
	clientSession.cookie=sessionRequest.cookie;
	if (sessionRequest.uid) {
		let u=await catnip.db.User.findOne({id: sessionRequest.uid});
		if (u) {
			clientSession.user={
				id: u.id,
				email: u.email
			};
		}
	}

	if (catnip.getSetting("install"))
		clientSession.redirect="/install";

	if (catnip.getSetting("googleClientId") &&
			catnip.getSetting("googleClientSecret"))
		clientSession.googleAuthUrl=createGoogleAuthClient(sessionRequest.origin).code.getUri();
});

catnip.addAction("initSessionRequest",async (sessionRequest)=>{
	if (sessionRequest.getUserId()) {
		sessionRequest.user=await User.findOne(sessionRequest.getUserId());
		if (!sessionRequest.user)
			sessionRequest.setUserId();
	}

	sessionRequest.getUser=()=>{
		return sessionRequest.user;
	}

	sessionRequest.assertCap=(cap)=>{
		if (!sessionRequest.user)
			throw new Error("Not authorized.");

		let caps=getCapsByRole(sessionRequest.user.role);
		if (!caps.includes(cap))
			throw new Error("Not authorized.");
	}
});

catnip.addAction("serverMain",async (options)=>{
	if (options.createadmin) {
		let [email,password]=options.createadmin.split(":");
		if (await User.findOne({email: email})) {
			console.log("Admin user exists alreay...");
		}

		else {
			u=new User({
				email: email,
				role: "admin"
			});
			u.setPassword(password);
			await u.save();
			console.log("Admin user created.");
		}
	}

	if (!await User.findOne({role: "admin"})) {
		console.log("No admin user, entering install mode.")
		await catnip.setSetting("install",true);
	}

	else
		await catnip.setSetting("install",false);
});