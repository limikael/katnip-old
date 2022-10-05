import {katnip} from "katnip";
import LoginForm from "./LoginForm.jsx";
import SignupForm from "./SignupForm.jsx";
import LinkEmailPage from "./LinkEmailPage.jsx";
import {useState} from "react";

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

katnip.addElement("PasswordLoginElement",PasswordLoginElement,{
	internal: true
});

katnip.addRoute("linkemail",LinkEmailPage);