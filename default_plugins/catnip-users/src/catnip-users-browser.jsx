import {catnip, delay, buildUrl, apiFetch, useChannel, getSessionId} from "catnip";
import LoginPage from "../components/LoginPage.jsx";
import SignupPage from "../components/SignupPage.jsx";
import AccountPage from "../components/AccountPage.jsx";
import UserAdmin from "../components/UserAdmin.jsx";
import SessionTokenPage from "../components/SessionTokenPage.jsx";
import InstallPage from "../components/InstallPage.jsx";
import Auth from "../components/Auth.jsx";
import PEOPLE from "bootstrap-icons/icons/people.svg";
import User from "./User.js";

catnip.addRoute("install",InstallPage);
catnip.addRoute("login",LoginPage);
catnip.addRoute("signup",SignupPage);
catnip.addRoute("account",AccountPage);
catnip.addRoute("sessiontoken",SessionTokenPage);
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
	let userData=useChannel(buildUrl("user",{sessionId: getSessionId()}));
	if (!userData)
		return null;

	return new User(userData);
});

catnip.addAction("setCurrentUser",(userData)=>{
	let channelId=buildUrl("user",{sessionId: getSessionId()});

	if (userData && !userData.id)
		throw new Error("This is not user data");

	catnip.setChannelValue(channelId,userData);
});