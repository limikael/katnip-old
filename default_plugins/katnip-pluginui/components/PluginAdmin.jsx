import {A, ItemList, apiFetch, usePromise, PromiseButton, delay, bindArgs} from "katnip";
import dayjs from "dayjs";
import {PackageList} from "./PackageList.jsx";

export function PluginList({request}) {
	let columns={
		name: {label: "Plugin"},
		description: {label: "Description"}
	};

	async function getItems() {
		return await apiFetch("/api/getInstalledPlugins");
	}

	async function onDelete(id) {
		await apiFetch("/api/removePlugin",{plugin: id});
	}

	return (
		<>
			<div>
				<h1 class="d-inline-block mb-3">Plugins</h1>
				<A class="btn btn-outline-primary align-text-bottom ms-2 btn-sm"
						href={"/admin/plugin/?add=1"}>
					Add Plugin
				</A>
			</div>
			<ItemList
				items={getItems} 
				columns={columns}
				ondelete={onDelete}
				refreshOnDelete={false}/>
		</>
	);
}

export function AddPlugin({request}) {
	async function getInstalled() {
		let installed=await apiFetch("/api/getInstalledPlugins");

		let result=[];
		for (let i of installed)
			result.push(i.name);

		return result;
	}

	async function onInstallClick(plugin) {
		await apiFetch("/api/addPlugin",{plugin});
	}

	return (<>
		<h1 class="mb-3">Add Plugin</h1>
		<div class="border-bottom"></div>
		<PackageList installed={getInstalled} oninstall={onInstallClick} keyword="katnip-plugin"/>
	</>);
}

export function PluginAdmin({request}) {
	if (request.query.add)
		return <AddPlugin request={request}/>;

	else
		return <PluginList request={request}/>;
}