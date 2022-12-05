import {setTemplateContext, PromiseButton, useForm, BsGroupInput, BsAlert, apiFetch,
		setChannelValue, useChannel, setLocation} from "katnip";
import {useState} from "react";

export default function InstallDatabasePage() {
	let redirect=useChannel("redirect");
	let form=useForm({initial: {
		driver: "sqlite3",
		filename: "database.db",
		host: "localhost",
		user: "",
		pass: "",
		name: "katnip"
	}});
	let [message, setMessage]=useState();

	if (redirect!="/installdb") {
		setLocation("/");
		return;
	}

	setTemplateContext({title: "Install"});

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
