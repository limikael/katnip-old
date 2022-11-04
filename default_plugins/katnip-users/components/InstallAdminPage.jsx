import {setTemplateContext, PromiseButton, useForm, BsGroupInput, BsAlert, apiFetch,
		setChannelValue, useChannel, setLocation} from "katnip";
import {useState} from "react";

function randomPass(length) {
	var result='';
	var characters='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i=0; i<length; i++)
		result+=characters.charAt(Math.floor(Math.random()*characters.length));

	return result;
}

export default function InstallAdminPage() {
	let redirect=useChannel("redirect");
	let form=useForm({initial: {username: "admin", password: randomPass(16)}});
	let [message, setMessage]=useState();

	if (redirect!="/installadmin") {
		setLocation("/");
		return;
	}

	setTemplateContext({title: "Install"});

	async function write() {
		setMessage();
		await apiFetch("/api/installAdmin",form.getCurrent());
		katnip.setLocation("/");
	}	

	return (<>
		<p>Now, let's set up an admin user.</p>

		<BsAlert message={message} ondismiss={setMessage}/>

		<form style="max-width: 40rem">
			<BsGroupInput title="Admin Username" {...form.field("username")}/>
			<BsGroupInput type="text" title="Password" {...form.field("password")}/>
		</form>

		<PromiseButton action={write} onerror={setMessage}
				class="btn btn-primary">
			Install Admin
		</PromiseButton>
	</>);
}
