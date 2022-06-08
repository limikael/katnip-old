import {useTemplateContext, PromiseButton, useForm, BsGroupInput, BootstrapAlert, apiFetch,
		setChannelValue, setCurrentUser} from "catnip";
import {useState} from "preact/compat";

export default function InstallPage() {
	let tc=useTemplateContext();
	let [values, field]=useForm();
	let [message, setMessage]=useState();

	tc.setTitle("Install");

	async function write() {
		setMessage();
		let u=await apiFetch("/api/install",values);
		setCurrentUser(u.user);
		setChannelValue("redirect",null);
		catnip.setLocation("/admin");
	}

	return (<>
		<p>Let's get things set up!</p>

		<BootstrapAlert message={message} ondismiss={setMessage}/>

		<form style="max-width: 40rem">
			<BsGroupInput title="Admin Email" {...field("email")}/>
			<BsGroupInput type="password" title="Password" {...field("password")}/>
			<BsGroupInput type="password" title="Repeat Password" {...field("repeatPassword")}/>
		</form>

		<PromiseButton action={write} onerror={setMessage}
				class="btn btn-primary">
			Install
		</PromiseButton>
	</>);
}