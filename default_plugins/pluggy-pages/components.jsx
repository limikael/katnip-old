import {pluggy, A, AdminListTable, AdminMessages} from "pluggy";
import {useApiFetch, apiFetch, useForm, useCounter} from "pluggy";
import {useState} from "preact/compat";
import XMLToReactModule from 'xml-to-react';

const XMLToReact=XMLToReactModule.default;

function PageEdit({request}) {
	let pageId=request.query.id;
	let url=pageId?"/api/getPage":null;
	let [counter,invalidate]=useCounter();
	let initial=useApiFetch(url,{id: pageId},[url,pageId,counter]);
	let [current,field,modified]=useForm(initial,[initial,url]);
	let isUpdate=!!request.query.id;
	let loading=(pageId && !initial);
	let [saving,setSaving]=useState();

	async function onSubmitClick(ev) {
		ev.preventDefault();
		setSaving(true);

		try {
			let successMessage=isUpdate?"Page updated":"Page created";
			pluggy.dismissAdminMessages();
			let res=await apiFetch("/api/savePage",current);
			let url=pluggy.buildUrl("/admin/page",{id: res.id});
			pluggy.setLocation(url,{replace: true});
			pluggy.showAdminMessage(successMessage);
			invalidate();
		}

		catch (e) {
			pluggy.showAdminMessage(e);
		}

		setSaving(false);
	}

	return (
		<>
			<h1 class="d-inline-block">{isUpdate?"Edit Page":"Add New Page"}</h1>
			<AdminMessages />
			{loading && <div class="spinner-border m-3"/>}
			{!loading &&
				<form>
					<div class="container-fluid border rounded p-3">
						<div class="mb-3">
							<input type="text" class="form-control" {...field("title")}
									placeholder="Page Title"/>
						</div>
						<div class="mb-3">
							<textarea rows={10} class="form-control font-monospace" {...field("content")}/>
						</div>
						<button type="submit" class="btn btn-primary" onclick={onSubmitClick}
								disabled={!modified || saving}>
							{saving && <span class="spinner-border spinner-border-sm me-2"/>}
							{isUpdate?"Update Page":"Create New Page"}
						</button>
					</div>
				</form>
			}
		</>
	);
}

function PageList({request}) {
	let [counter,invalidate]=useCounter();
	let pages=useApiFetch("/api/getAllPages",{},[counter]);
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
					href="/admin/page?new=1">
				Add Page
			</A>
			<AdminMessages />
			{pages==undefined && <div class="spinner-border m-3"/>}
			<AdminListTable
					items={pages} 
					columns={columns}
					href="/admin/page"
					ondelete={onDelete}/>
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
	let page=useApiFetch("/api/getPage",{id: pageId},[pageId]);
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
		<h1>{page.title}</h1>
		{reactTree}
	</>);
}