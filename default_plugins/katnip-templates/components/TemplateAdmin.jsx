import {katnip, A, ItemList, setLocation, buildUrl, BsAlert, BsLoader,
		useApiFetch, apiFetch, useCounter, useValueChanged, useChannel,
		PromiseButton, usePromise, useTemplateContext, BsInput} from "katnip";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import ContentEditor from "../../katnip-pages/components/ContentEditor.jsx";

function TemplateProperties({form}) {
	let template=form.getCurrent();

	return <>
		<div class="mb-3"><b>Template</b></div>
		<div class="form-group mb-3">
			<label class="form-label mb-1">Title</label>
			<BsInput {...form.field("title")} />
		</div>
		<div class="form-group mb-3">
			<label class="form-label mb-1">Routes</label>
			<BsInput {...form.field("routes")} />
		</div>
	</>;
}

function TemplateEdit({request}) {
	async function read() {
		let data={title: "New Template", content: [], routes: ""};

		if (request.query.id)
			data=await apiFetch("/api/template/get",{id: request.query.id});

		if (!data.meta)
			data.meta={};

		return data;
	}

	async function write(data) {
		let saved=await apiFetch("/api/template/save",data);
		setLocation(buildUrl("/admin/template",{id: saved.id}));
		return saved;
	}

	return (
		<ContentEditor
				saveLabel={request.query.id?"Update Template":"Create New Template"}
				metaEditor={TemplateProperties} 
				read={read}
				write={write}
				deps={[request.query.id]}/>
	);
}

function TemplateList({request}) {
	let columns={
		title: {label: "Title"},
		routes: {label: "Routes"}
	};

	async function getTemplates() {
		return await apiFetch("/api/template/list");
	}

	async function onDelete(id) {
		await apiFetch("/api/template/delete",{id: id});
		return "Template deleted.";
	}

	return (
		<>
			<div>
				<h1 class="d-inline-block mb-3">Templates</h1>
				<A class="btn btn-outline-primary align-text-bottom ms-2 btn-sm"
						href="/admin/template?new=1">
					Add Template
				</A>
			</div>
			<ItemList
					items={getTemplates} 
					columns={columns}
					href="/admin/template"
					ondelete={onDelete}/>
		</>
	);
}

export function TemplateAdmin({request}) {
	if (request.query.id || request.query.new)
		return <TemplateEdit request={request}/>

	return <TemplateList request={request}/>
}
