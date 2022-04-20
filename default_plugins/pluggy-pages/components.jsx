import {pluggy, A, AdminListTable, useApiForm, AdminMessages, useApiFetch, apiFetch} from "pluggy";
import XMLToReactModule from 'xml-to-react';

const XMLToReact=XMLToReactModule.default;

export function ListPages({request}) {
	let {data,invalidate}=useApiFetch("/api/getAllPages");
	let columns={
		title: {label: "Title"},
		stamp: {label: "Date"}
	};

	async function onDelete(id) {
		await apiFetch("/api/deletePage",{id: id});
		pluggy.dismissAdminMessages();
		pluggy.showAdminMessage("Page deleted");
		invalidate();
	}

	return (
		<>
			<h1 class="d-inline-block">Pages</h1>
			<A class="btn btn-outline-primary align-text-bottom ms-2 btn-sm"
					href="/admin/page">
				Add Page
			</A>
			<AdminMessages />
			<AdminListTable
					items={data} 
					columns={columns}
					href="/admin/page"
					ondelete={onDelete}/>
		</>
	);
}

export function EditPage({request}) {
	let form=useApiForm({
		fetchUrl: "getPage",
		saveUrl: "savePage",
	});

	return (
		<>
			<h1 class="d-inline-block">{form.isUpdate()?"Edit Page":"Add New Page"}</h1>
			<AdminMessages />
			<form {...form.formProps()}>
				<div class="container-fluid border rounded p-3">
					<div class="mb-3">
						<input type="text" class="form-control" {...form.inputProps("title")}
								placeholder="Page Title"/>
					</div>
					<div class="mb-3">
						<textarea rows={10} class="form-control font-monospace" {...form.inputProps("content")}/>
					</div>
					<button type="submit" class="btn btn-primary" {...form.submitProps()}>
						{form.isUpdate()?"Update Page":"Create New Page"}
					</button>
				</div>
			</form>
		</>
	);
}

export function PageView({request}) {
	let {data,invalidate}=useApiFetch("/api/getPage",{
		id: request.params[1]
	});

	let page=data;
	if (!page)
		return;

	let tags=["h1","h2","h3","h4","h5","div","span","b","a","p","hr"];
	let options={};

	for (let tag of tags)
		options[tag]=(attrs)=>({type: tag, props: attrs});

	options["Fragment"]=(attrs)=>({type: Fragment, props: attrs});

	for (elementName in pluggy.elements) {
		let elementFunc=pluggy.elements[elementName];
		options[elementName]=(attrs)=>({type: elementFunc, props: attrs});
	}

	const xmlToReact=new XMLToReact(options);
	const reactTree=xmlToReact.convert(`<Fragment>${page.content}</Fragment>`);

	return (<>
		<h1>{page.title}</h1>
		{reactTree}
	</>);
}