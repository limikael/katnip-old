import {katnip, A, ItemList, setLocation, buildUrl, BsAlert,
		useApiFetch, apiFetch, useCounter, useValueChanged, useChannel,
		PromiseButton, usePromise} from "katnip";
import {useForm} from "../../../src/utils/use-form.jsx";
import {BsInput} from "katnip";
import {useState, useContext} from "preact/compat";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import ContentEditor from "./ContentEditor.jsx";

dayjs.extend(relativeTime);

function PageProperties({form}) {
	let termOptions=useApiFetch("/api/getTaxonomyOptions",{taxonomy: "category"});
	let page=form.getCurrent();

	let url;
	if (page.slug)
		url=window.location.origin+"/page/"+page.slug;

	let urlStyle={
		"white-space": "nowrap",
		"overflow": "hidden",
		"text-overflow": "ellipsis",
		display: "block",
		direction: "rtl",
		"text-align": "left",
	};

	let extraFields=[];
	katnip.doAction("pageFields",extraFields,form);

	return <>
		<div class="mb-3"><b>Document</b></div>
		<div class="form-group mb-3">
			<label class="form-label mb-1">Title</label>
			<BsInput {...form.field("title")} />
		</div>
		{url &&
			<div class="form-group mb-3">
				<label class="form-label mb-0">Permalink</label>
				<A style={urlStyle} href={url}>{url}</A>
			</div>
		}
		<div class="form-group mb-3">
			<label class="form-label mb-1">Page Title</label>
			<BsInput type="select"
					{...form.field("meta.hideTitle")} 
					options={{"":"Show Page Title","true":"Hide Page Title"}}/>
		</div>
		<div class="form-group mb-3">
			<label class="form-label mb-1">Category</label>
			<BsInput type="select" {...form.field("meta.category")}
					options={termOptions}>
				<option />
			</BsInput>
		</div>
		{extraFields}
	</>;
}

function PageEdit({request}) {
	async function read() {
		let data={title: "New Page", content: []};

		if (request.query.id)
			data=await apiFetch("/api/page/get",{id: request.query.id});

		if (!data.meta)
			data.meta={};

		return data;
	}

	async function write(data) {
		let saved=await apiFetch("/api/page/save",data);
		setLocation(buildUrl("/admin/page",{id: saved.id}));
		return saved;
	}

	return (
		<ContentEditor
				saveLabel={request.query.id?"Update Page":"Create New Page"}
				metaEditor={PageProperties} 
				read={read}
				write={write}
				deps={[request.query.id]}/>
	);
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
