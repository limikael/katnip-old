import {catnip, A, ItemList, ItemForm, setLocation, buildUrl, ItemContext, BootstrapAlert} from "catnip";
import {useApiFetch, apiFetch, useForm, useCounter, useValueChanged, useChannel} from "catnip";
import {useState, useContext} from "preact/compat";
import XMLToReactModule from 'xml-to-react';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(relativeTime);
const XMLToReact=XMLToReactModule.default;

function PageEdit({request}) {
	let pageId=request.query.id;
	let [page,setPage]=useState();

	//console.log("here..");

	async function read() {
		if (!pageId)
			return {};

		let fetchedPage=await apiFetch("/api/page/get",{id: pageId});
		setPage(fetchedPage);

		return fetchedPage;
	}

	async function write(data) {
		let saved=await apiFetch("/api/page/save",data);

		setPage(saved);
		setLocation(buildUrl("/admin/page",{id: saved.id}));

		return "Saved...";
	}

	let pageLink;
	if (page && page.slug) {
		let o=window.location.origin;
		let url=o+"/page/"+page.slug;

		pageLink=<div class="form-text mt-1"><b>Permalink:</b> <A href={url}>{url}</A></div>
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
					{pageLink}
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
	function formatStamp(item) {
		return dayjs.unix(item.stamp).from(dayjs());
	}

	let columns={
		title: {label: "Title"},
		stamp: {label: "Date", cb: formatStamp}
	};

	async function getPages() {
		return await apiFetch("/api/page/list");
	}

	async function onDelete(id) {
		await apiFetch("/api/page/delete",{id: id});
		return "Page deleted.";
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
			<ItemList
					items={getPages} 
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
	let tc=catnip.useTemplateContext();
	let pageQuery=request.params[1];
	let pageInfo=useApiFetch("/api/getPageView",{query: pageQuery},[pageQuery]);
	let page=pageInfo;//useChannel(pageInfo?"pageContent":null,{id: pageInfo?.id});

	if (!page)
		return;

	if (page instanceof Error)
		return <div class="mt-5"><BootstrapAlert message={page}/></div>;

	let tags=["h1","h2","h3","h4","h5","div","span","b","p","hr"];
	let options={};

	for (let tag of tags)
		options[tag]=(attrs)=>({type: tag, props: attrs});

	options["Fragment"]=(attrs)=>({type: Fragment, props: attrs});

	options["a"]=(attrs)=>({type: A, props: attrs});

	for (elementName in catnip.elements) {
		let elementFunc=catnip.elements[elementName];
		options[elementName]=(attrs)=>({type: elementFunc, props: attrs});
	}

	const xmlToReact=new XMLToReact(options);
	const reactTree=xmlToReact.convert(`<Fragment>${page.content}</Fragment>`);

	tc.setTitle(page.title);

	return (<>
		{reactTree}
	</>);
}