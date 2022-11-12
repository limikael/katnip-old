import {A, ItemList, apiFetch, usePromise, PromiseButton, delay, bindArgs} from "katnip";
import CHECK_LG from "bootstrap-icons/icons/check-lg.svg";

export function ThemeList({request}) {
	let columns={
		name: {label: "Theme"},
		description: {label: "Description"}
	};

	async function getItems() {
		return await apiFetch("/api/getInstalledThemes");
	}

	async function onDelete(id) {
		await apiFetch("/api/removeTheme",{plugin: id});
	}

	async function onActivate(id) {
		await apiFetch("/api/activateTheme",{theme: id});
	}

	function isActive(item) {
		return item.active;
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
						href={"/admin/plugin/?add=1"}>
					Add Theme
				</A>
			</div>
			<ItemList
				items={getItems} 
				columns={columns}
				ondelete={onDelete}
				refreshOnDelete={false}
				actions={actions}/>
		</>
	);
}

export function ThemeAdmin({request}) {
	if (request.query.add)
		return <AddTheme request={request}/>;

	else
		return <ThemeList request={request}/>;
}