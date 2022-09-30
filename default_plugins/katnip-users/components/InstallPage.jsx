import {useTemplateContext, PromiseButton, useForm, BsGroupInput, BsAlert, apiFetch,
		setChannelValue, setCurrentUser} from "katnip";
import {useState} from "preact/compat";

export default function InstallPage() {
	let tc=useTemplateContext();
	let form=useForm({initial: {email: "admin"}});
	let [message, setMessage]=useState();

	tc.set({title: "Install"});

	async function write() {
		setMessage();
		let user=await apiFetch("/api/install",form.getCurrent());
		setCurrentUser(user);
		setChannelValue("redirect",null);
		katnip.setLocation("/admin");
	}	

	return (<>
		<p>Let's get things set up!</p>

		<BsAlert message={message} ondismiss={setMessage}/>

		<form style="max-width: 40rem">
			<BsGroupInput title="Admin Email" {...form.field("email")}/>
			<BsGroupInput type="password" title="Password" {...form.field("password")}/>
			<BsGroupInput type="password" title="Repeat Password" {...form.field("repeatPassword")}/>
		</form>

		<PromiseButton action={write} onerror={setMessage}
				class="btn btn-primary">
			Install
		</PromiseButton>
	</>);
}