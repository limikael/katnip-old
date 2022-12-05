import {katnip, A, ItemList, setLocation, buildUrl, BsAlert,
		useApiFetch, apiFetch, useCounter, useValueChanged, useChannel,
		PromiseButton, usePromise, useTemplateContext, BsInput, objectMap} from "katnip";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import ContentEditor from "../../katnip-pages/components/ContentEditor.jsx";

function TemplateProperties({form}) {
	let template=form.getCurrent();

/*	for (let k in taxonomies)
		taxonomies[k].termOptions={};

	if (terms)
		for (let term of terms)
			if (taxonomies[term.taxonomy])
				taxonomies[term.taxonomy].termOptions[term.id]=term.title;*/

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
		{objectMap(template.taxonomies,(taxonomy,id)=>
			<div class="form-group mb-3">
				<label class="form-label mb-1">{taxonomy.title}</label>
				<BsInput type="select" options={taxonomy.termOptions}
						{...form.field("taxonomy."+id)}>
					<option/>
				</BsInput>
			</div>
		)}
	</>;
}

function TemplateEdit({request}) {
	async function read() {
		let data;

		if (request.query.id)
			data=await apiFetch("/api/template/get",{id: request.query.id});

		else 
			data={
				title: "New Template", 
				routes: "",
				content: await apiFetch("/api/getDefaultTemplateContent")
			}

		if (!data.meta)
			data.meta={};

		if (!data.terms)
			data.terms=[];

		data.taxonomy={};

		data.taxonomies={};
		katnip.doAction("getTaxonomies",data.taxonomies);
		for (let k in data.taxonomies)
			data.taxonomies[k].termOptions={};

		let terms=await apiFetch("/api/listTerms");
		for (let term of terms)
			if (data.taxonomies[term.taxonomy]) {
				data.taxonomies[term.taxonomy].termOptions[term.id]=term.title;

				if (data.terms.includes(term.id))
					data.taxonomy[term.taxonomy]=term.id;
			}

		return data;
	}

	async function write(data) {
		data.terms=[];
		for (let k in data.taxonomy)
			if (data.taxonomy[k])
				data.terms.push(Number(data.taxonomy[k]));

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
