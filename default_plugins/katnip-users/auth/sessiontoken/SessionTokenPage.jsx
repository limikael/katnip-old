import {useTemplateContext, PromiseButton, quest, useForm, setCurrentUser,
		setLocation, useChannel, useForceUpdate} from "katnip";
import {useState} from "react";

export default function SessionTokenPage({request}) {
	let token=katnip.parseCookieString(document.cookie).token;
	if (!token) {
		token=crypto.randomUUID();
		document.cookie=`token=${token};expires=Fri, 31 Dec 9999 23:59:59 GMT;path=/`;
	}

	let [values, field]=useForm({token});
	let tc=useTemplateContext();
	let postloginpath=useChannel("postloginpath");
	let forceUpdate=useForceUpdate();
	tc.setTitle("Session Token");

	async function onUseTokenClick() {
		/*if (!values.token) {
			token=crypto.randomUUID();
			document.cookie=`token=${token};expires=Fri, 31 Dec 9999 23:59:59 GMT;path=/`;
			values.token=token;
			forceUpdate();
			return;
		}*/

		let userData=await quest("/api/useToken",{query: {token: values.token}});

		document.cookie=`token=${values.token};expires=Fri, 31 Dec 9999 23:59:59 GMT;path=/`;
		setCurrentUser(userData);
		setLocation(postloginpath);
	}

	return <>
		<div style="max-width: 40rem">
			<p>
				This is your session token. It will be stored in a cookie in this browser. Save it permanently before continuing,
				so that you can use it to log in from another browser.
			</p>
			<p>
				If you have a session token from another device or browser, you can restore the
				previous session by entering that session token here.
			</p>
			<input type="text" class="form-control mb-3" {...field("token")}/>
			<p>
				<PromiseButton class="btn btn-primary" onclick={onUseTokenClick}>
					Use This Token
				</PromiseButton>
			</p>
		</div>
	</>;
}