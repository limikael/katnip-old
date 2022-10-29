import {katnip, delay, buildUrl, apiFetch, addSetting} from "katnip";
import User, {UserAuthMethod} from "./User.js";
import {getCapsByRole} from "./rolecaps.js";
import "./katnip-users-api.js";

import "../auth/google/auth-google-main.js";
import "../auth/sessiontoken/auth-sessiontoken-main.js";
import "../auth/lightning/auth-lightning-main.js";
import "../auth/email/auth-email-main.js";

katnip.addModel(User);
katnip.addModel(UserAuthMethod);

katnip.createCrudApi(User);

katnip.addSetting("install",{session: true});
katnip.addSettingCategory("auth",{title: "Authorization", priority: 15});

katnip.addAction("initRequest",async (req)=>{
	let uid=katnip.getSessionValue(req.sessionId);
	if (uid) {
		let user=await User.findOne(uid);

		if (user) {
			req.user=user;
			await req.user.populateAuthMethods();
		}
	}

	req.getUser=()=>{
		return req.user;
	}

	req.getUserId=()=>{
		if (!req.user)
			return null;

		return req.user.id;
	}

	req.assertCap=(cap)=>{
		if (!req.user)
			throw new Error("Not authorized.");

		let caps=getCapsByRole(req.user.role);
		if (!caps.includes(cap))
			throw new Error("Not authorized.");
	}
});

katnip.addAction("initChannels",(channelIds, req)=>{
	channelIds.push(buildUrl("user",{sessionId: req.sessionId}));
	channelIds.push("authMethods");
	channelIds.push("redirect");
});

katnip.addChannel("authMethods",async ({}, req)=>{
	let authMethods=[];
	await katnip.doActionAsync("authMethods",authMethods,req);

	return authMethods;
});

katnip.addChannel("user",async ({sessionId}, req)=>{
	console.log("param sesionId: "+sessionId);
	console.log("req sessionId: "+req.sessionId);

	if (req.sessionId!=sessionId)
		throw new Error("Wrong session");

	if (!req.user)
		return null;

	return req.user;
});

katnip.addChannel("redirect",({})=>{
	if (katnip.getSetting("install"))
		return "/install";
});

katnip.addAction("serverMain",async (options)=>{
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
		await katnip.setSetting("install","admin");
	}

	else
		await katnip.setSetting("install",false);
});