import {useInstance, useEventUpdate, useValueChanged} from "./react-util.jsx";
import EventEmitter from "events";

class Form extends EventEmitter {
	constructor(conf) {
		super();

		this.updateConf(conf);
		this.current=undefined;
		this.error=null;
		this.load();
	}

	setError(e) {
		this.error=e;
		this.emit("change");
	}

	updateConf=(conf)=>{
		for (let k in conf)
			this[k]=conf[k];
	}

	getCurrent=()=>{
		return this.current;
	}

	getCurrentFieldValue(name) {
		let fieldPath=name.split(/[\/\.]/);
		let o=this.current;

		while (fieldPath.length>1) {
			o=o[fieldPath[0]];
			fieldPath.splice(0,1);
		}

		return o[fieldPath[0]];
	}

	setCurrent=(current)=>{
		this.current=current;
		this.emit("change");
	}

	field=(name, cls="")=>{
		if (!this.current)
			return;

		let v=this.getCurrentFieldValue(name)
		if (!v)
			v="";

		let onFieldChange=(newValue)=>{
			if (newValue instanceof Event)
				newValue=newValue.target.value;

			if (this.error && this.error.field==name)
				this.setError(null);

			let fieldPath=name.split(/[\/\.]/);
			let current=this.current;

			while (fieldPath.length>1) {
				current=current[fieldPath[0]];
				fieldPath.splice(0,1);
			}

			current[fieldPath[0]]=newValue;
			this.emit("change");
		}

		let o={
			value: v,
			onchange: onFieldChange
		}

		if (this.class)
			cls+=" "+this.class;

		if (this.error && this.error.field==name)
			cls+=" is-invalid";

		if (cls)
			o.class=cls;

		return o;
	}

	load=()=>{
		let v=this.initial;
		if (typeof v=="function")
			v=v();

		if (v instanceof Promise) {
			this.current=undefined;
			this.emit("change");

			v
				.then((values)=>{
					this.current=values;
					this.emit("change");
				})
				.catch((e)=>{
					this.current=e;
					this.emit("change");
				})
		}

		else {
			this.current=v;
			this.emit("change");
		}
	}
}

export function useForm(conf) {
	if (!conf.initial)
		throw new Error("no initial values for form");

	let form=useInstance(Form,conf);
	form.updateConf(conf);
	useEventUpdate(form,"change");
	let changed=useValueChanged(form.deps);
	if (changed)
		form.load();

	return form;
}