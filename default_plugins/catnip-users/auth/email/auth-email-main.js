import {catnip} from "catnip";
import User, {UserAuthMethod} from "../../src/User.js";

catnip.addAction("authMethods",(authMethods, req)=>{
	authMethods.push({
		id: "email",
		title: "Email and Password",
		element: "PasswordLoginElement",
		priority: 10
	});
});

catnip.addApi("/api/login",async ({email, password}, req)=>{
	let user=await catnip.db.User.findOneByAuth("email", email);

	if (!user)
		throw new Error("Bad credentials.");

	await user.populateAuthMethods();
	user.authMethods["email"].assertPassword(password);
	await catnip.setSessionValue(req.sessionId,user.id);

	return user;
});

catnip.addApi("/api/signup",async ({email, password, repeatPassword}, req)=>{
	if (await User.findOneByAuth("email",email))
		throw new Error("The email is already in use");

	if (!email)
		throw new Error("Invalid email");

	if (password!=repeatPassword)
		throw new Error("The passwords don't match");

	let user=new catnip.db.User();
	user.role="user";
	await user.save();

	let userAuthMethod=new UserAuthMethod({
		userId: user.id,
		method: "email",
		token: email
	});

	userAuthMethod.setPassword(password);
	userAuthMethod.save();

	await catnip.setSessionValue(req.sessionId,user.id);
	await user.populateAuthMethods();

	return user;
});
