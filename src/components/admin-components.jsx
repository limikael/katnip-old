import {usePromise, useForm} from "pluggy";
import {createContext, useContext, useState} from "preact/compat";

const ItemContext=createContext();

export function ItemForm(props) {
	let baseItem=usePromise(props.item,[props.deps]);
	let [item,field,modified]=useForm(baseItem,[baseItem,props.deps]);
	let [saving,setSaving]=useState();
	let [message,setMessage]=useState();

	if (!item)
		item={};

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

	let content=props.children;
	if (baseItem===undefined)
		content=<div class="spinner-border m-3"/>;

	return (
		<ItemContext.Provider value={context}>
			<form>
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