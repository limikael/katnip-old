import {A, ItemList, apiFetch, usePromise, PromiseButton, delay, bindArgs, setLocation} from "katnip";
import CHECK_LG from "bootstrap-icons/icons/check-lg.svg";
import {PackageList} from "./PackageList.jsx";

export function ThemeList({request}) {
	let columns={
		name: {label: "Theme"},
		description: {label: "Description"}
	};

	async function getItems() {
		return await apiFetch("/api/getInstalledThemes");
	}

	async function onDelete(id) {
		await apiFetch("/api/removeTheme",{theme: id});
	}

	async function onActivate(id) {
		await apiFetch("/api/activateTheme",{theme: id});
	}

	function isActive(item) {
		return item.active;
	}

	function isDeletable(item) {
		return item.deletable;
	}

	let actions=[
		{
			icon: CHECK_LG,
			fn: onActivate,
			activeCb: isActive
		}
	];

	return (
		<>
			<div>
				<h1 class="d-inline-block mb-3">Themes</h1>
				<A class="btn btn-outline-primary align-text-bottom ms-2 btn-sm"
						href={"/admin/theme/?add=1"}>
					Add Theme
				</A>
			</div>
			<ItemList
				items={getItems} 
				columns={columns}
				ondelete={onDelete}
				refreshOnDelete={true}
				actions={actions}
				deletableCb={isDeletable}/>
		</>
	);
}

export function AddTheme({request}) {
	async function getInstalled() {
		let installed=await apiFetch("/api/getInstalledThemes");

		let result=[];
		for (let i of installed)
			result.push(i.name);

		return result;
	}

	async function onInstallClick(theme) {
		await apiFetch("/api/addTheme",{theme});
		setLocation("/admin/theme");
	}

	return (<>
		<h1 class="mb-3">Add Theme</h1>
		<div class="border-bottom"></div>
		<PackageList installed={getInstalled} oninstall={onInstallClick} keyword="katnip-theme"/>
	</>);
}

export function ThemeAdmin({request}) {
	if (request.query.add)
		return <AddTheme request={request}/>;

	else
		return <ThemeList request={request}/>;
}