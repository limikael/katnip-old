import {katnip, delay, buildUrl, apiFetch, useChannel, getSessionId} from "katnip";
import LoginPage from "../components/LoginPage.jsx";
import AccountPage from "../components/AccountPage.jsx";
import InstallPage from "../components/InstallPage.jsx";
import PEOPLE from "bootstrap-icons/icons/people.svg";
import User from "./User.js";
import {getRoles} from "../src/rolecaps.js";

import "../auth/google/auth-google-browser.jsx";
import "../auth/sessiontoken/auth-sessiontoken-browser.jsx";
import "../auth/lightning/auth-lightning-browser.jsx";
import "../auth/email/auth-email-browser.jsx";

katnip.addRoute("install",InstallPage);
katnip.addRoute("login",LoginPage);
katnip.addRoute("account",AccountPage);

let roleOptions={};
roleOptions[""]="";
for (let role of getRoles())
	roleOptions[role]=role;

katnip.createCrudUi("user",{
	columns: {
		id: {label: "User ID"},
		username: {label: "Username"},
		role: {label: "Role"}
	},
	fields: {
		username: {label: "Username"},
		role: {label: "Role", type: "select", options: roleOptions}
	},
	priority: 30,
	icon: PEOPLE
});

katnip.addAction("useCurrentUser",()=>{
	let userData=useChannel(buildUrl("user",{sessionId: getSessionId()}));
	if (!userData)
		return null;

	if (!userData.authMethods)
		throw new Error("User data doesn't have populated auth methods");

	return new User(userData);
});

katnip.addAction("setCurrentUser",(userData)=>{
	let channelId=buildUrl("user",{sessionId: getSessionId()});

	if (userData && !userData.id)
		throw new Error("This is not user data");

	katnip.setChannelValue(channelId,userData);
});