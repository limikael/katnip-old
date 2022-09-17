import {catnip, A, ItemList, setLocation, buildUrl, ItemContext, BootstrapAlert} from "catnip";
import {useApiFetch, apiFetch, useForm, useCounter, useValueChanged, useChannel, PromiseButton, usePromise} from "catnip";
import {BsInput} from "catnip";
import {useState, useContext} from "preact/compat";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(relativeTime);

function PageEdit({request}) {
	let pageId=request.query.id;
	let [message, setMessage]=useState();
	let [count, invalidate]=useCounter();

	async function read() {
		if (!pageId)
			return {};

		return await apiFetch("/api/page/get",{id: pageId});
	}

	let [values, field]=useForm(read,[pageId,count]);
	if (values instanceof Error)
		setMessage(values);

	async function write() {
		setMessage();
		let saved=await apiFetch("/api/page/save",values);
		setMessage("Page saved...");
		setLocation(buildUrl("/admin/page",{id: saved.id}));
		invalidate();
	}

	let pageLink;
	if (pageId && values && !(values instanceof Error)) {
		let o=window.location.origin;
		let url=o+"/page/"+values.slug;

		pageLink=<div class="form-text mt-1"><b>Permalink:</b> <A href={url}>{url}</A></div>
	}

	return (<>
		<h1 class="mb-3">{pageId?"Edit Page":"Add New Page"}</h1>
		{message && <BootstrapAlert message={message} ondismiss={setMessage}/>}
		{(pageId && !values) && <div class="spinner-border m-3"/>}
		{(values && !(values instanceof Error)) && 
			<div class="container-fluid border rounded p-3 bg-light">
				<div class="mb-3">
					<BsInput {...field("title")} placeholder="Page Title"/>
					{pageLink}
				</div>
				<BsInput class="font-monospace mb-3" rows={10} type="textarea" {...field("content")} />
				<PromiseButton class="btn btn-primary" onclick={write}>
					{pageId?"Update Page":"Create New Page"}
				</PromiseButton>
			</div>
		}
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

export default function PageAdmin({request}) {
	if (request.query.id || request.query.new)
		return <PageEdit request={request}/>

	return <PageList request={request}/>
}
