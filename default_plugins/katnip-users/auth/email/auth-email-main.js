import {katnip, assertForm} from "katnip";
import {assertPassword, setPassword} from "./auth-email-util.js";

katnip.addApi("/api/changePassword",async (params, req)=>{
	let {oldPassword, newPassword, repeatNewPassword}=params;

	req.assertCap("user");
	let user=req.getUser();
	await user.populateAuthMethods();

	assertPassword(user,oldPassword);
	await setPassword(user,newPassword);

	await user.authMethods.email.save();
});

katnip.addApi("/api/changeEmail",async (params, req)=>{
	let {password, email}=params;

	req.assertCap("user");
	let user=req.getUser();
	await user.populateAuthMethods();

	if (!user.authMethods.email)
		throw new Error("no email auth method");

	assertPassword(user,password);
	user.authMethods.email.token=email;

	await user.authMethods.email.save();
	await req.setUser(user);
});

katnip.addApi("/api/login",async ({login, password}, req)=>{
	let user=await katnip.db.User.findOneByAuth("email", login);

	if (!user)
		user=await katnip.db.User.findOne({username: login});

	if (!user)
		throw new Error("Bad credentials.");

	await user.populateAuthMethods();
	assertPassword(user,password);

	await req.setUser(user);
});

katnip.addApi("/api/signup",async (form, req)=>{
	assertForm(form,{
		email: {validate: "email", required: "Please enter an email"},
		password: {validate: "password", required: "Please enter a password"}
	});

	if (await User.findOneByAuth("email",form.email))
		throw new Error("The email is already in use");

	if (form.password!=form.repeatPassword)
		throw new Error("The passwords don't match");

	let user=req.getUser();
	if (!user) {
		user=new katnip.db.User();
		user.role="user";
		await user.save();
	}

	await user.populateAuthMethods();

	setPassword(user,form.password);
	user.authMethods.email.token=form.email;
	await user.authMethods.email.save();

	await katnip.setSessionValue(req.sessionId,user.id);
	await user.populateAuthMethods();

	await req.setUser(user);
});

katnip.addAction("authMethods",(authMethods, req)=>{
	authMethods.push({
		id: "email",
		title: "Email and Password",
		element: "PasswordLoginElement",
		href: "/linkemail",
		priority: 10
	});
});
