import {catnip, delay, buildUrl, apiFetch, addSetting} from "catnip";
import User from "./User.js";
import {getCapsByRole} from "./rolecaps.js";
import "./catnip-users-api.js";

import "../auth/google/auth-google-main.js";
import "../auth/sessiontoken/auth-sessiontoken-main.js";
import "../auth/lightning/auth-lightning-main.js";

catnip.addModel(User);

catnip.addSetting("install");
catnip.addSettingCategory("auth",{title: "Authorization", priority: 15});

catnip.addAction("initRequest",async (req)=>{
	let uid=catnip.getSessionValue(req.sessionId);
	if (uid)
		req.user=await User.findOne(uid);

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

catnip.addAction("initChannels",(channelIds, req)=>{
	channelIds.push(buildUrl("user",{sessionId: req.sessionId}));
});

catnip.addChannel("user",async ({sessionId}, req)=>{
	if (req.sessionId!=sessionId)
		throw new Error("Wrong session");

	if (!req.user)
		return null;

	return req.user;
});

catnip.addChannel("redirect",({})=>{
	if (catnip.getSetting("install"))
		return "/install";
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