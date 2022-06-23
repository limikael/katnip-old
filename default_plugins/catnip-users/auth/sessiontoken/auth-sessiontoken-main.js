import {catnip, delay, buildUrl, apiFetch} from "catnip";
import User from "../../src/User.js";

catnip.addSetting("authSessionTokenEnable",{
	title: "Login with Session Token", 
	category: "auth",
	type: "select",
	session: true,
	options: {
		false: "Disabled", 
		true: "Enabled"
	}
});

catnip.addApi("/api/useToken",async ({token}, req)=>{
	if (!token)
		throw new Error("That's not a token");

	let user=await User.findOne({token: token});

	if (!user) {
		user=new User({token: token});
		await user.save();
	}

	await catnip.setSessionValue(req.sessionId,user.id);

	return user;
});
