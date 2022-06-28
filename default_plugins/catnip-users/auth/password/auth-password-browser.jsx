import {catnip} from "catnip";
import LoginForm from "./LoginForm.jsx";
import SignupForm from "./SignupForm.jsx";
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

catnip.addElement("PasswordLoginElement",PasswordLoginElement);
