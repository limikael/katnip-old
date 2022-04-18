import {useApi} from "pluggy";
import {useRef} from "preact/compat";
import {useForceUpdate, buildUrl} from "../utils/react-util.jsx";
import pluggy from "pluggy";

class ApiForm {
	constructor(options={}) {
		this.options=options;
		this.id=this.options.id;

		if (this.id) {
			let o={};
			o[this.options.idField]=this.id;
			let url=pluggy.buildUrl("/api/"+this.options.fetchUrl,o);

			fetch(url).then(async(response)=>{
				this.data=await response.json();
				this.options.forceUpdate();
			});
		}

		else {
			this.data={};
		}
	}

	isUpdate() {
		return (this.id!=undefined);
	}

	onChange=(e)=>{
		this.data[e.target.dataset.field]=e.target.value;
	}

	onSubmit=(e)=>{
		e.preventDefault();

		let submitUrl=buildUrl(this.options.saveUrl,this.data);

		fetch("/api/"+submitUrl).then(async(response)=>{
			let responseData=await response.json();
			let request=pluggy.getCurrentRequest();

			let o={};
			o[this.options.idField]=responseData[this.options.idField];
			let u=buildUrl(request.path,o);
			pluggy.setLocation(u,{replace: true});

			//pluggy.showAdminMessage();
		});
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

	if (!options.idField)
		options.idField="id";

	let q=pluggy.getCurrentRequest().query;
	if (q[options.idField])
		options.id=q[options.idField];

	if (!ref.current || options.id!=ref.current.id) {
		options.forceUpdate=forceUpdate;
		ref.current=new ApiForm(options);
	}

	return ref.current;
}

