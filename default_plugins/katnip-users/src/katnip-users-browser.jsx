import {catnip, delay, buildUrl, apiFetch, useChannel, getSessionId} from "catnip";
import LoginPage from "../components/LoginPage.jsx";
import AccountPage from "../components/AccountPage.jsx";
import UserAdmin from "../components/UserAdmin.jsx";
import InstallPage from "../components/InstallPage.jsx";
import PEOPLE from "bootstrap-icons/icons/people.svg";
import User from "./User.js";

import "../auth/google/auth-google-browser.jsx";
import "../auth/sessiontoken/auth-sessiontoken-browser.jsx";
import "../auth/lightning/auth-lightning-browser.jsx";
import "../auth/email/auth-email-browser.jsx";

catnip.addRoute("install",InstallPage);
catnip.addRoute("login",LoginPage);
catnip.addRoute("account",AccountPage);
catnip.addRoute("admin/user",UserAdmin);

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

	if (!userData.authMethods)
		throw new Error("User data doesn't have populated auth methods");

	return new User(userData);
});

catnip.addAction("setCurrentUser",(userData)=>{
	let channelId=buildUrl("user",{sessionId: getSessionId()});

	if (userData && !userData.id)
		throw new Error("This is not user data");

	catnip.setChannelValue(channelId,userData);
});