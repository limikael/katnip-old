import {katnip, delay, buildUrl, apiFetch, useChannel, getRoles} from "katnip";
import LoginPage from "../components/LoginPage.jsx";
import AccountPage from "../components/AccountPage.jsx";
import InstallAdminPage from "../components/InstallAdminPage.jsx";
import InstallDatabasePage from "../components/InstallDatabasePage.jsx";
import PEOPLE from "bootstrap-icons/icons/people.svg";

import "../auth/google/auth-google-browser.jsx";
import "../auth/sessiontoken/auth-sessiontoken-browser.jsx";
import "../auth/lightning/auth-lightning-browser.jsx";
import "../auth/email/auth-email-browser.jsx";

katnip.addRoute("installdb",InstallDatabasePage);
katnip.addRoute("installadmin",InstallAdminPage);
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
