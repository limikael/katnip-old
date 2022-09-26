import {katnip, delay, buildUrl, apiFetch} from "katnip";
import User from "../../src/User.js";

katnip.addSetting("authSessionTokenEnable",{
	title: "Login with Session Token", 
	category: "auth",
	type: "select",
	session: true,
	options: {
		false: "Disabled", 
		true: "Enabled"
	}
});

katnip.addApi("/api/useToken",async (req)=>{
	let {token}=req.query;

	if (!token || token.length!=36)
		throw new Error("That's not a token");

	let user=await User.findOne({token: token});

	if (!user) {
		user=new User({token: token});
		await user.save();
	}

	await katnip.setSessionValue(req.sessionId,user.id);

	return user;
});
