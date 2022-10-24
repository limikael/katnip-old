import {useTemplateContext, PromiseButton, useForm, BsGroupInput, BsAlert, apiFetch,
		setChannelValue, setCurrentUser, useChannel} from "katnip";
import {useState} from "react";

function DatabaseInstallPage() {
	let tc=useTemplateContext();
	let form=useForm({initial: {
		driver: "sqlite3",
		filename: "database.db",
		host: "localhost",
		user: "",
		pass: "",
		name: "katnip"
	}});
	let [message, setMessage]=useState();

	tc.set({title: "Install"});

	async function write() {
		setMessage();
		await apiFetch("/api/installDb",form.getCurrent());
	}	

	let driverOptions={
		sqlite3: "SQLite",
		mysql: "MySQL"
	};

	return (<>
		<p>First, let's get your database setup.</p>

		<BsAlert message={message} ondismiss={setMessage}/>

		<form style="max-width: 40rem">
			<BsGroupInput title="Database Driver" {...form.field("driver")} type="select" options={driverOptions}
					description="Select the database driver you would like to use."/>
			{form.getCurrent().driver=="sqlite3" && <>
				<BsGroupInput title="Filename" {...form.field("filename")}
						description="Filename relative to the project directory."/>
			</>}

			{form.getCurrent().driver=="mysql" && <>
				<BsGroupInput title="Host" {...form.field("host")}
						description="Database Host, including port if applicable."/>
				<BsGroupInput title="Username" {...form.field("user")}
						description="Database Username."/>
				<BsGroupInput title="Password" {...form.field("pass")}
						description="Database password."/>
				<BsGroupInput title="Database" {...form.field("name")}
						description="The name of the database."/>
			</>}

		</form>

		<PromiseButton action={write} onerror={setMessage}
				class="btn btn-primary">
			Install Database
		</PromiseButton>
	</>);
}

function randomPass(length) {
	var result='';
	var characters='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i=0; i<length; i++)
		result+=characters.charAt(Math.floor(Math.random()*characters.length));

	return result;
}

function AdminInstallPage() {
	let tc=useTemplateContext();
	let form=useForm({initial: {username: "admin", password: randomPass(16)}});
	let [message, setMessage]=useState();

	tc.set({title: "Install"});

	async function write() {
		setMessage();
		let user=await apiFetch("/api/install",form.getCurrent());
		setCurrentUser(user);
		setChannelValue("redirect",null);
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

export default function InstallPage() {
	let installMode=useChannel("install");
	if (!installMode) {
		setChannelValue("redirect",null);
		katnip.setLocation("/")
		return;
	}

	switch (installMode) {
		case "db":
			return <DatabaseInstallPage />;
			break;

		case "admin":
			return <AdminInstallPage />;
			break;
	}
}