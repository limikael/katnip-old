import {catnip, useChannel, A} from "catnip";
import LightningLoginPage from "./LightningLoginPage.jsx";

catnip.addRoute("lightninglogin",LightningLoginPage);

function LightningLoginButton() {
	let authLightningEnable=(String(useChannel("authLightningEnable"))=="true");

	if (!authLightningEnable)
		return;

	return (
		<A class="btn btn-danger mb-3" style="width: 100%" href="/lightninglogin">
			<b>Login With Lightning</b>
		</A>
	);
}

catnip.addAction("loginPageItems",(items)=>{
	items.push(<LightningLoginButton/>);
});
