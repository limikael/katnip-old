import {catnip, delay, buildUrl, apiFetch} from "catnip";
import {bech32, bech32m} from "bech32";
import secp256k1 from "secp256k1";
import ExpiringMap from "../../../../src/utils/ExpiringMap.js";
import User from "../../src/User.js";

let k1BySessionId=new ExpiringMap(10*60*1000);
let sessionIdByK1=new ExpiringMap(10*60*1000);

catnip.addSetting("authLightningEnable",{
	title: "Login with Lightning", 
	category: "auth",
	type: "select",
	session: true,
	options: {
		false: "Disabled", 
		true: "Enabled"
	}
});

catnip.addApi("/api/lightningAuth",async (query, req)=>{
	let {k1, key, sig}=query;

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

	let user=await User.findOne({token: key});

	if (!user) {
		user=new User({token: key});
		await user.save();
	}

	await catnip.setSessionValue(sessionId,user.id);
	catnip.notifyChannel("user",{sessionId: sessionId});

	return {status: "OK"};
});

catnip.addApi("/api/lightningAuthCode",async (params, req)=>{
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