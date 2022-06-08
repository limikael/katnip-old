import {catnip, delay, buildUrl, apiFetch, useChannel} from "catnip";
import LoginPage from "../components/LoginPage.jsx";
import SignupPage from "../components/SignupPage.jsx";
import AccountPage from "../components/AccountPage.jsx";
import UserAdmin from "../components/UserAdmin.jsx";
import InstallPage from "../components/InstallPage.jsx";
import Auth from "../components/Auth.jsx";
import PEOPLE from "bootstrap-icons/icons/people.svg";
import User from "./User.js";

catnip.addRoute("install",InstallPage);
catnip.addRoute("login",LoginPage);
catnip.addRoute("signup",SignupPage);
catnip.addRoute("account",AccountPage);
catnip.addRoute("admin/user",UserAdmin);
catnip.addRoute("auth",Auth);

catnip.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Users",
		href: "/admin/user",
		priority: 30,
		icon: PEOPLE
	});
});

catnip.addAction("useCurrentUser",()=>{
	let cookie=useChannel("cookie");
	let userData=useChannel(buildUrl("user",{cookie: cookie}));
	if (!userData)
		return null;

	return new User(userData);
});

catnip.addAction("setCurrentUser",(userData)=>{
	let cookie=catnip.getChannelValue("cookie");
	let channelId=buildUrl("user",{cookie: cookie});

	if (userData && !userData.email)
		throw new Error("This is not user data");

	catnip.setChannelValue(channelId,userData);
});