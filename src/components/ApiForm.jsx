import {useApi} from "pluggy";
import {useRef} from "preact/compat";
import {useForceUpdate, buildUrl} from "../utils/react-util.jsx";

class ApiForm {
	constructor(options) {
		this.options=options;

		fetch("/api/"+this.options.fetchUrl).then(async(response)=>{
			this.data=await response.json();
			this.options.forceUpdate();
		});
	}

	onChange=(e)=>{
		this.data[e.target.dataset.field]=e.target.value;
	}

	onSubmit=(e)=>{
		e.preventDefault();

		let submitUrl=buildUrl(this.options.saveUrl,this.data);

		fetch("/api/"+submitUrl).then(async(response)=>{
			let responseData=await response.json();
		});
	}

	isUpdate() {
		return false;
	}

	inputProps(field) {
		if (!this.data)
			return null;

		return {
			value: this.data[field],
			onchange: this.onChange,
			"data-field": field
		}
	}

	formProps() {
		return {
			onsubmit: this.onSubmit
		}
	}
}

export function useApiForm(options) {
	let ref=useRef(null);
	let forceUpdate=useForceUpdate();

	if (!ref.current) {
		options.forceUpdate=forceUpdate;
		ref.current=new ApiForm(options);
	}

	return ref.current;
}

/*export function useApiForm(populateUrl, saveUrl) {
	let data=useApi(populateUrl);

	function onChange(e) {
	}

	function onSubmit(e) {
	}

	return {
		formProps: ()=>{},
		submitProps: ()=>{
			return {
				onclick: onSubmit
			}
		},
	}
}*/
