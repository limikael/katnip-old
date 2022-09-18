import {catnip, A, ItemList, setLocation, buildUrl, BsAlert, BsLoader} from "catnip";
import {useApiFetch, apiFetch, useCounter, useValueChanged, useChannel, PromiseButton, usePromise} from "catnip";
import {useForm} from "../../../src/utils/use-form.jsx";
import {BsInput} from "catnip";
import {useState, useContext} from "preact/compat";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(relativeTime);

function PageEdit({request}) {
	let [message, setMessage]=useState();
	let form=useForm({
		initial: async ()=>{
			if (!request.query.id)
				return {};

			return await apiFetch("/api/page/get",{id: request.query.id});
		},
		deps: [request.query.id]
	});

	async function write() {
		setMessage();
		try {
			let saved=await apiFetch("/api/page/save",form.getCurrent());
			setLocation(buildUrl("/admin/page",{id: saved.id}));
			form.setCurrent(saved);
			setMessage("Saved...");
		}

		catch (e) {
			setMessage(e);
		}
	}

	function PageLink({page}) {
		if (!page.slug)
			return;

		let url=window.location.origin+"/page/"+page.slug;
		return (
			<div class="form-text mt-1">
				<b>Permalink:</b> <A href={url}>{url}</A>
			</div>
		);
	}

	return (<>
		<h1 class="mb-3">{request.query.id?"Edit Page":"Add New Page"}</h1>
		<BsAlert message={message} ondismiss={setMessage}/>
		<BsLoader resource={form.getCurrent()}>
			<div class="container-fluid border rounded p-3 bg-light">
				<div class="mb-3">
					<BsInput {...form.field("title")} placeholder="Page Title"/>
					<PageLink page={form.getCurrent()}/>
				</div>
				<BsInput class="font-monospace mb-3" rows={10} type="textarea" {...form.field("content")} />
				<PromiseButton class="btn btn-primary" onclick={write}>
					{request.query.id?"Update Page":"Create New Page"}
				</PromiseButton>
			</div>
		</BsLoader>
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
