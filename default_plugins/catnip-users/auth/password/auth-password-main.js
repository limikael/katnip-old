import {catnip} from "catnip";

catnip.addAction("authMethods",(authMethods, req)=>{
	authMethods.push({
		id: "password",
		title: "Email and Password",
		element: "PasswordLoginElement",
		priority: 10
	});
});