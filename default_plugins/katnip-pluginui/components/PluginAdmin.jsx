import {A, ItemList, apiFetch, usePromise, PromiseButton, delay, bindArgs} from "katnip";
import dayjs from "dayjs";

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

function loadable(content, fn) {
	if (content===undefined)
		return <div class="spinner-border m-3"/>;

	if (content instanceof Error)
		return <BsAlert message={content}/>;

	return fn();
}

export function AddPlugin({request}) {
	let pluginData=usePromise(async()=>{
		let request=await fetch("https://registry.npmjs.com/-/v1/search?text=keywords:katnip-plugin");
		let result=await request.json();

		let installed=await apiFetch("/api/getInstalledPlugins");
		result.installed=[];
		for (let i of installed)
			result.installed.push(i.name);

		return result;
	});

	async function onInstallClick(plugin) {
		await apiFetch("/api/addPlugin",{plugin});
	}

	let content=loadable(pluginData,()=>{
		//console.log(pluginData);
		return pluginData.objects.map((o)=><>
			<div class="border-bottom d-flex flex-row">
				<div class="flex-grow-1">
					<h5>{o.package.name}</h5>
					<p class="text-muted mb-2">{o.package.description}</p>
					<p class="text-muted">
						<b>{o.package.publisher.username}</b>
						<span class="mx-2">published {o.package.version}</span>
						&bull;<span class="mx-2">{dayjs(o.package.date).from(dayjs())}</span>
					</p>
				</div>
				<div>
					{pluginData.installed.includes(o.package.name) && 
						<button class="btn btn-outline-primary" disabled={true}>
							Installed
						</button>
					}
					{!pluginData.installed.includes(o.package.name) && 
						<PromiseButton class="btn btn-primary" onclick={bindArgs(onInstallClick,o.package.name)}>
							Install
						</PromiseButton>
					}
				</div>
			</div>
		</>);
	});

	return (<>
		<h1 class="mb-3">Add Plugin</h1>
		<div class="border-bottom mb-3"></div>
		{content}
	</>);
}

export function PluginAdmin({request}) {
	if (request.query.add)
		return <AddPlugin request={request}/>;

	else
		return <PluginList request={request}/>;
}