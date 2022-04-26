import {pluggy, A, AdminListTable, AdminMessages, ItemForm, setLocation, buildUrl} from "pluggy";
import {useApiFetch, apiFetch, useForm, useCounter, useValueChanged} from "pluggy";
import {useState} from "preact/compat";
import XMLToReactModule from 'xml-to-react';

const XMLToReact=XMLToReactModule.default;

function PageEdit({request}) {
	let pageId=request.query.id;

	async function read() {
		if (!pageId)
			return {};

		return await apiFetch("/api/page/get",{id: pageId});
	}

	async function write(data) {
		let saved=await apiFetch("/api/page/save",data);
		setLocation(buildUrl("/admin/page",{id: saved.id}));

		return "Saved...";
	}

	return (<>
		<h1 class="mb-3">{pageId?"Edit Page":"Add New Page"}</h1>
		<ItemForm
				item={read}
				save={write}
				deps={[pageId]}>
			<div class="container-fluid border rounded p-3 bg-light">
				<div class="mb-3">
					<ItemForm.Input
							name="title"
							type="text"
							class="form-control"
							placeholder="Page Title"/>
				</div>
				<div class="mb-3">
					<ItemForm.Input
							name="content"
							input="textarea"
							rows={10}
							class="form-control font-monospace"/>
				</div>
				<ItemForm.Submit class="btn btn-primary">
					{pageId?"Update Page":"Create New Page"}
				</ItemForm.Submit>
			</div>
		</ItemForm>
	</>);
}

function PageList({request}) {
	let [counter,invalidate]=useCounter();

	async function getPages() {
		return await apiFetch("/api/page/list");
	}

	let columns={
		title: {label: "Title"},
		stamp: {label: "Date"}
	};

	async function onDelete(id) {
		pluggy.dismissAdminMessages();
		await apiFetch("/api/page/delete",{id: id});
		pluggy.showAdminMessage("Page deleted");
		invalidate();
	}

	return (
		<>
			<div>
				<h1 class="d-inline-block mb-3">Pages</h1>
				<A class="btn btn-outline-primary align-text-bottom ms-2 btn-sm"
						href="/admin/page?new=1">
					Add Page
				</A>
			</div>
			<AdminListTable
					items={getPages} 
					columns={columns}
					href="/admin/page"
					ondelete={onDelete}
					deps={[counter]}/>
		</>
	);
}

export function PageAdmin({request}) {
	if (request.query.id || request.query.new)
		return <PageEdit request={request}/>

	return <PageList request={request}/>
}

export function PageView({request}) {
	let pageId=request.params[1];
	let page=useApiFetch("/api/page/get",{id: pageId},[pageId]);
	if (!page)
		return;

	let tags=["h1","h2","h3","h4","h5","div","span","b","p","hr"];
	let options={};

	for (let tag of tags)
		options[tag]=(attrs)=>({type: tag, props: attrs});

	options["Fragment"]=(attrs)=>({type: Fragment, props: attrs});

	options["a"]=(attrs)=>({type: A, props: attrs});

	for (elementName in pluggy.elements) {
		let elementFunc=pluggy.elements[elementName];
		options[elementName]=(attrs)=>({type: elementFunc, props: attrs});
	}

	const xmlToReact=new XMLToReact(options);
	const reactTree=xmlToReact.convert(`<Fragment>${page.content}</Fragment>`);

	return (<>
		<h1 class="mt-5 pb-2 border-bottom mb-4">{page.title}</h1>
		{reactTree}
	</>);
}