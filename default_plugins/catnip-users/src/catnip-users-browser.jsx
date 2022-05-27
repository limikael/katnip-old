import {catnip, delay, buildUrl, apiFetch} from "catnip";
import LoginPage from "../components/LoginPage.jsx";
import SignupPage from "../components/SignupPage.jsx";
import AccountPage from "../components/AccountPage.jsx";
import UserAdmin from "../components/UserAdmin.jsx";
import InstallPage from "../components/InstallPage.jsx";
import Auth from "../components/Auth.jsx";
import PEOPLE from "bootstrap-icons/icons/people.svg";

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
