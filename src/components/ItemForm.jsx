import {usePromise, useForm} from "catnip";
import {createContext, useContext, useState} from "preact/compat";

export const ItemContext=createContext();

export function ItemForm(props) {
	if (!props.deps)
		props.deps=[];

	let baseItem=usePromise(props.item,props.deps);
	let [item,field,modified]=useForm(baseItem,[baseItem,...props.deps],{
		onchange: (item)=>{
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

	let formProps={...props};
	formProps.onchange=null;

	return (
		<ItemContext.Provider value={context}>
			<form {...formProps}>
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

ItemForm.Controls = ({ controls }) => {
	let elements=[];
	for (let k in controls) {
		let control=controls[k];
		console.log(control);

		let cls="form-control";
		if (control.input=="select" || control.type=="select")
			cls="form-select";

		elements.push(
			<div class="mb-3">
				<label class="form-label">{control.title}</label>
				<ItemForm.Input name={control.name} class={cls} {...control} />
			</div>
		);
	}

	return elements;
};


ItemForm.Input=(props)=>{
	let context=useContext(ItemContext);

	props={...props, ...context.field(props.name)};

	if (props.input=="textarea" || props.type=="textarea")
		return (
			<textarea {...props}>{context.item[props.name]}</textarea>
		);

	props.value=context.item[props.name];

	if (props.input=="select" || props.type=="select") {
		let options=null;
		if (props.options)
			options=optionsFromObject(props.options);

		return (
			<select {...props}>
				{options}
				{props.children}
			</select>
		);
	}

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
