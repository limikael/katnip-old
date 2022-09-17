import {apiFetch, useChannel, useForm, BsGroupInput, 
		PromiseButton, BootstrapAlert, A, setLocation,
		useRevertibleState, buildUrl, useApiFetch} from "catnip";
import {useState} from "preact/compat";

function SettingsTabs({request, categories}) {
	let categoryKey=request.query.category;
	let categoriesArray=Object.values(categories);
	categoriesArray.sort((a,b)=>a.priority-b.priority);

	return (
		<ul class="nav nav-tabs mb-3">
			{categoriesArray.map(category=>{
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

function evaluateCondition(condition, values) {
	for (let fieldId in condition)
		if (String(values[fieldId])!=String(condition[fieldId]))
			return false;

	return true;
}

function SettingsInput({setting, field, values}) {
	if (setting.condition && !evaluateCondition(setting.condition,values))
		return null;

	return (
		<BsGroupInput {...setting} {...field(setting.id)}/>
	);
}

export default function Settings({request}) {
	let categoryId=request.query.category;

	let categories=useApiFetch("/api/getSettingCategories");
	let [message, setMessage]=useRevertibleState("",[categoryId]);

	async function read() {
		return apiFetch("/api/getSettings",{category: categoryId});
	}

	let [values, field]=useForm(read,[categoryId]);

	async function write() {
		setMessage();
		await apiFetch("/api/saveSettings",values);

		for (let setting of categories[categoryId].settings)
			if (setting.session)
				catnip.setChannelValue(setting.id,values[setting.id]);

		setMessage("Settings saved...");
	}

	if (!categoryId) {
		setLocation(buildUrl("/admin/settings",{category: "settings"}));
		return;
	}

	return (<>
		<h1 class="mb-3">Settings</h1>
		{categories && <SettingsTabs request={request} categories={categories}/>}
		{message && <BootstrapAlert message={message} ondismiss={setMessage}/>}
		{(!values || !categories) && <div class="spinner-border m-3"/>}
		{(values && categories) &&
			<form style="max-width: 40rem">
				{categories[categoryId].settings.map(setting=>
					<SettingsInput setting={setting} field={field} values={values} />
				)}
				<PromiseButton class="btn btn-primary" onclick={write} onerror={setMessage}>
				Save Settings
				</PromiseButton>
			</form>
		}
	</>);
}