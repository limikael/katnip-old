import {apiFetch, useChannel, useForm, BsGroupInput, 
		PromiseButton, BsAlert, A, setLocation,
		useRevertibleState, buildUrl, useApiFetch,
		BsLoader} from "katnip";
import {useState} from "react";

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

export function Settings({request}) {
	let categoryId=request.query.category;
	let categories=useApiFetch("/api/getSettingCategories");
	let [message, setMessage]=useRevertibleState("",[categoryId]);

	let form=useForm({
		deps: [categoryId],
		initial: async()=>{
			return apiFetch("/api/getSettings",{category: categoryId});
		}
	});

	async function write() {
		setMessage();
		await apiFetch("/api/saveSettings",form.getCurrent());

		for (let setting of categories[categoryId].settings)
			if (setting.session)
				katnip.setChannelValue(setting.id,form.getCurrent()[setting.id]);

		setMessage("Settings saved...");
	}

	if (!categoryId) {
		setLocation(buildUrl("/admin/settings",{category: "settings"}));
		return;
	}

	return (<>
		<h1 class="mb-3">Settings</h1>
		<BsAlert message={message} ondismiss={setMessage}/>
		{categories && <>
			<SettingsTabs request={request} categories={categories}/>
			<BsLoader resource={categories && form.getCurrent()}>
				<form style="max-width: 40rem">
					{categories[categoryId].settings.map(setting=>
						<SettingsInput setting={setting} field={form.field} values={form.getCurrent()} />
					)}
					<PromiseButton class="btn btn-primary" onclick={write} onerror={setMessage}>
						Save Settings
					</PromiseButton>
				</form>
			</BsLoader>
		</>}
	</>);
}