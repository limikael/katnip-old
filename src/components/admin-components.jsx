import {usePromise, useForm} from "pluggy";
import {createContext, useContext, useState} from "preact/compat";

export const ItemContext=createContext();

export function ItemForm(props) {
	if (!props.deps)
		props.deps=[];

	let baseItem=usePromise(props.item,props.deps);
	let [item,field,modified]=useForm(baseItem,[baseItem,...props.deps],{
		onchange: (item)=>{
			console.log("on change here...");
			console.log(item);

			if (props.onchange)
				props.onchange(item);
		}
	});
	let [saving,setSaving]=useState();
	let [message,setMessage]=useState();

	if (!item)
		item={};

	/*if (modified && props.onchange)
		props.onchange(item);*/

	let context={item, field, saving, modified};

	function dismissMessage() {
		setMessage(null);
	}

	context.onsubmit=async ()=>{
		dismissMessage();
		setSaving(true);

		try {
			let message=await props.save(item);
			setMessage({message, class: "success"});
		}

		catch (e) {
			setMessage({message: e.message, class: "danger"});
		}

		setSaving(false);
	}

	if (baseItem instanceof Error)
		return (
			<div class={`alert alert-dismissible alert-danger`}>
				{baseItem.message}
			</div>
		);

	let content=props.children;
	if (baseItem===undefined)
		content=<div class="spinner-border m-3"/>;

	return (
		<ItemContext.Provider value={context}>
			<form {...props}>
				{message &&
					<div class={`alert alert-dismissible alert-${message.class}`}>
						<button type="button" class="btn-close" data-bs-dismiss="alert"
								onclick={dismissMessage}></button>
						{message.message}
					</div>
				}
				{content}
			</form>
		</ItemContext.Provider>
	);
}

ItemForm.Input=(props)=>{
	let context=useContext(ItemContext);

	props={...props, ...context.field(props.name)};

	if (props.input=="textarea")
		return (
			<textarea {...props}>{context.item[props.name]}</textarea>
		);

	props.value=context.item[props.name];

	if (props.input=="select")
		return (
			<select {...props}>{props.children}</select>
		);

	return (
		<input {...props} />
	);
}

ItemForm.Submit=(props)=>{
	let context=useContext(ItemContext);

	props.onclick=(ev)=>{
		ev.preventDefault();
		context.onsubmit();
	}

	props.disabled=false;
	if (!context.modified || context.saving)
		props.disabled=true;

	return (
		<button {...props}>
			{context.saving && <span class="spinner-border spinner-border-sm me-2"/>}
			{props.children}
		</button>
	);
}
