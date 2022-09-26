import {katnip, delay, buildUrl, apiFetch} from "katnip";
import {bech32, bech32m} from "bech32";
import secp256k1 from "secp256k1";
import ExpiringMap from "../../../../src/utils/ExpiringMap.js";
import User,{UserAuthMethod} from "../../src/User.js";

let k1BySessionId=new ExpiringMap(10*60*1000);
let sessionIdByK1=new ExpiringMap(10*60*1000);

katnip.addSetting("authLightningEnable",{
	title: "Login with Lightning", 
	category: "auth",
	type: "select",
	session: true,
	options: {
		"": "Disabled", 
		"true": "Enabled"
	}
});

katnip.addApi("/api/lightningAuth",async (req)=>{
	try {
		let {k1, key, sig}=req.query;

		//console.log(query);
		let sigData=Buffer.from(sig,'hex');
		let k1Data=Buffer.from(k1,'hex');
		let keyData=Buffer.from(key,'hex');

		let signature=secp256k1.signatureImport(sigData);
		let res=secp256k1.ecdsaVerify(signature, k1Data, keyData);
		if (!res)
			throw new Error("Unable to verify signature");

		let sessionId=sessionIdByK1.get(k1);
		if (!sessionId)
			throw new Error("Unknown session id. Expired?");

		let user;
		let uid=katnip.getSessionValue(sessionId);
		if (uid)
			user=await User.findOne(uid);

		if (!user)
			user=await User.findOneByAuth("lightning",key);

		if (!user) {
			user=new User();
			await user.save();
		}

		await user.populateAuthMethods();
		if (!user.authMethods["lightning"]) {
			let existing=await User.findOneByAuth("lightning",key);
			if (existing)
				throw new Error("Already used for another user");

			let userAuthMethod=new UserAuthMethod({
				userId: user.id,
				method: "lightning",
				token: key
			});

			await userAuthMethod.save();
		}

		await katnip.setSessionValue(sessionId,user.id);
		katnip.notifyChannel("user",{sessionId: sessionId});

		return {status: "OK"};
	}

	catch (e) {
		return {status: "ERROR", reason: e.message};
	}
});

katnip.addApi("/api/lightningAuthCode",async (req)=>{
	let k1=k1BySessionId.get(req.sessionId);

	if (!k1)
		k1=crypto.randomBytes(32).toString("hex");

	k1BySessionId.set(req.sessionId,k1);
	sessionIdByK1.set(k1,req.sessionId);

	let url=buildUrl(req.origin+"/api/lightningAuth",{
		k1: k1,
		tag: "login"
	});

	let words=bech32.toWords(Buffer.from(url,"utf8"));
	let code=bech32.encode("lnurl",words,1023);

	return code;
});

katnip.addAction("authMethods",(authMethods, req)=>{
	if (katnip.getSetting("authLightningEnable"))
		authMethods.push({
			id: "lightning",
			title: "Lightning",
			href: "/lightninglogin",
			priority: 20
		});
});