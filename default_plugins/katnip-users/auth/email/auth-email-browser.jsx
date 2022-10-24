import {katnip} from "katnip";
import LoginForm from "./LoginForm.jsx";
import SignupForm from "./SignupForm.jsx";
import LinkEmailPage from "./LinkEmailPage.jsx";
import {useState} from "react";
import ChangePasswordTab from "./ChangePasswordTab.jsx";
import ChangeEmailTab from "./ChangeEmailTab.jsx";

function PasswordLoginElement() {
	let [signupMode, setSignupMode]=useState(false);

	function onSwitchMode(ev) {
		ev.preventDefault();

		setSignupMode(!signupMode);
	}

	if (signupMode)
		return <SignupForm onswitchmode={onSwitchMode}/>

	else
		return <LoginForm onswitchmode={onSwitchMode}/>
}

PasswordLoginElement.internal=true;

katnip.addElement(PasswordLoginElement,"PasswordLoginElement");

katnip.addRoute("linkemail",LinkEmailPage);

katnip.addAction("getAccountTabs",(accountTabs, user)=>{
	if (user.authMethods.email) {
		accountTabs.push({
			title: "Change Password",
			component: ChangePasswordTab,
			priority: 15,
		});

		accountTabs.push({
			title: "Change Email",
			component: ChangeEmailTab,
			priority: 20,
		});
	}
});
