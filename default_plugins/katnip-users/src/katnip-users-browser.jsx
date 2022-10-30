import {katnip, delay, buildUrl, apiFetch, useChannel, getSessionId, getRoles} from "katnip";
import LoginPage from "../components/LoginPage.jsx";
import AccountPage from "../components/AccountPage.jsx";
import InstallPage from "../components/InstallPage.jsx";
import PEOPLE from "bootstrap-icons/icons/people.svg";

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
