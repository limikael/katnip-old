import {katnip, A, ItemList, apiFetch, setLocation, buildUrl,
		useForm, useCounter, useValueChanged,
		BsInput, PromiseButton, BsLoader, usePromise} from "katnip";
import {useState} from "react";

export function createCrudUi(model, options={}) {
	options.model=model;

	if (!options.label)
		options.label=
			options.model.charAt(0).toUpperCase()+
			options.model.slice(1);

	if (!options.pluralLabel)
		options.pluralLabel=options.label+"s";

	function Edit({request}) {
		let [message, setMessage]=useState();
		let itemId=request.query.id;

		async function read() {
			if (!itemId)
				return {};

			return await apiFetch("/api/"+options.model+"/get",{id: itemId});
		}

		let form=useForm({deps: [itemId], initial: read});

		async function write() {
			let saved=await apiFetch("/api/"+options.model+"/save",form.getCurrent());
			setLocation(buildUrl("/admin/"+options.model,{id: saved.id}));
		}

		let headerText="Add New "+options.label;
		let buttonText="Create New "+options.label;
		if (itemId) {
			headerText="Edit "+options.label;
			buttonText="Update "+options.label;
		}

		let fieldEls=[]
		for (let k in options.fields) {
			let field=options.fields[k];

			fieldEls.push(<>
				<div class="mb-3">
					<label class="form-label">{field.label}</label>
					<BsInput {...field} {...form.field(k)}/>
				</div>
			</>);
		}

		return (
			<>
				<h1 class="mb-3">{headerText}</h1>
				<BsLoader resource={form.getCurrent()}>
					<form style="max-width: 40rem">
						<div class="container border rounded p-3 bg-light">
							{fieldEls}
							<PromiseButton class="btn btn-primary" onclick={write}>
								{buttonText}
							</PromiseButton>
						</div>
					</form>
				</BsLoader>
			</>
		);
	}

	function List() {
		async function getItems() {
			return await apiFetch("/api/"+options.model+"/list");
		}

		async function onDelete(id) {
			await apiFetch("/api/"+options.model+"/delete",{id: id});
			return "Deleted";
		}

		return (
			<>
				<div>
					<h1 class="d-inline-block mb-3">{options.pluralLabel}</h1>
					<A class="btn btn-outline-primary align-text-bottom ms-2 btn-sm"
							href={"/admin/"+options.model+"?new=1"}>
						Add {options.label}
					</A>
				</div>
				<ItemList
						items={getItems} 
						columns={options.columns}
						href={"/admin/"+options.model}
						ondelete={onDelete}/>
			</>
		);
	}

	function Admin({request}) {
		if (request.query.id || request.query.new)
			return <Edit request={request}/>

		return <List request={request}/>
	}

	katnip.addRoute("admin/"+options.model,Admin);
	katnip.addAction("getAdminMenu",(items)=>{
		items.push({
			title: options.pluralLabel,
			href: "/admin/"+options.model,
			priority: options.priority,
			icon: options.icon
		});
	});
}

export function useApiFetch(url, query={}, third, fourth) {
	let options={};
	let deps=[];

	if (Array.isArray(third))
		deps=third;

	if (Array.isArray(fourth))
		deps=fourth;

	if (third && Object(third)===third && !Array.isArray(third))
		options=third;

	if (fourth && Object(fourth)===fourth && !Array.isArray(fourth))
		options=fourth;

	//console.log("useApiFetch: "+url+" "+JSON.stringify(query)+" "+JSON.stringify(options));

	let result=usePromise(()=>{
		if (!url)
			return url;

		return apiFetch(url,query,options);
	},deps);

	return result;
}
