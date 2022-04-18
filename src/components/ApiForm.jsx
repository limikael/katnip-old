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

			pluggy.apiFetch("/api/"+this.options.fetchUrl,o)
				.then(response=>{
					this.data=response;
					this.options.forceUpdate();
				})
				.catch(err=>{
					pluggy.showAdminMessage(err,{variant: "danger"});
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
		this.modified=true;
		this.data[e.target.dataset.field]=e.target.value;
		this.options.forceUpdate();
	}

	onSubmit=(e)=>{
		e.preventDefault();

		let submitUrl=buildUrl(this.options.saveUrl,this.data);

		pluggy.dismissAdminMessages();

		pluggy.apiFetch("/api/"+this.options.saveUrl,this.data)
			.then(responseData=>{
				let request=pluggy.getCurrentRequest();

				let o={};
				o[this.options.idField]=responseData[this.options.idField];
				let u=buildUrl(request.path,o);
				pluggy.setLocation(u,{replace: true});

				this.modified=false;
				if (this.id)
					pluggy.showAdminMessage("User updated.");

				else
					pluggy.showAdminMessage("User created.");
			})
			.catch(err=>{
				pluggy.showAdminMessage(err,{variant: "danger"});
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

	submitProps() {
		if (!this.modified)
			return {disabled: true};
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

