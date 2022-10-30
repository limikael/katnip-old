import {katnip, delay, buildUrl, apiFetch, addSetting, User} from "katnip";
import "./katnip-users-api.js";

import "../auth/google/auth-google-main.js";
import "../auth/sessiontoken/auth-sessiontoken-main.js";
import "../auth/lightning/auth-lightning-main.js";
import "../auth/email/auth-email-main.js";

katnip.createCrudApi(User);

katnip.addSettingCategory("auth",{title: "Authorization", priority: 15});

/*katnip.addAction("serverMain",async (options)=>{
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
});*/