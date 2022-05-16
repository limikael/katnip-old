import {ItemForm, apiFetch, useSession, useForm, BsGroupInput, 
		PromiseButton, BootstrapAlert, A, setLocation,
		useRevertibleState, buildUrl} from "catnip";
import {useState} from "preact/compat";

function SettingsTabs({request}) {
	let categoryKey=request.query.category;
	let categories=Object.values(catnip.getSettingCategories());
	categories.sort((a,b)=>a.priority-b.priority);

	return (
		<ul class="nav nav-tabs mb-3">
			{categories.map(category=>{
				let href=buildUrl("/admin/settings/",{category: category.id});
				let linkCls="nav-link ";

				if (category.id==categoryKey)
					linkCls+=" active";

				return (
					<li class="nav-item ">
						<A class={linkCls} href={href}>{category.title}</A>
					</li>
				);
			})}
		</ul>
	);
}

export default function Settings({request}) {
	let categoryId=request.query.category;

	let [session, setSession]=useSession();
	let [message, setMessage]=useRevertibleState("",[categoryId]);

	async function read() {
		return apiFetch("/api/getSettings",{category: categoryId});
	}

	let [values, field]=useForm(read,[categoryId]);

	async function write() {
		setMessage();
		await apiFetch("/api/saveSettings",values);

		let o={};
		for (let setting of catnip.getSettings({category: categoryId, session: true}))
			o[setting.id]=values[setting.id];

		setSession(o);
		setMessage("Settings saved...");
	}

	if (!categoryId) {
		setLocation(buildUrl("/admin/settings",{category: "settings"}));
		return;
	}

	let category=catnip.getSettingCategories()[categoryId];

	return (<>
		<h1 class="mb-3">Settings</h1>
		<SettingsTabs request={request}/>
		{message && <BootstrapAlert message={message} ondismiss={setMessage}/>}
		{!values && <div class="spinner-border m-3"/>}
		{values &&
			<form style="max-width: 40rem">
				{catnip.getSettings({category: categoryId}).map(setting=>
					<BsGroupInput {...field(setting.id)} {...setting}/>
				)}
				<PromiseButton class="btn btn-primary" onclick={write} onerror={setMessage}>
				Save Settings
				</PromiseButton>
			</form>
		}
	</>);
}