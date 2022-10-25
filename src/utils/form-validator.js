export function sanitizeFormValue(value, spec={}) {
	if (!value)
		value="";

	switch (spec.validate) {
		case "username":
			value=value.replaceAll(/[\_\. ]/g,"");
			value=value.toLowerCase();
			break;

		default:
			value=value.trim();
			break;
	}

	return value;
}

export function validateFormValue(value, spec={}) {
	if (!value && spec.required)
		return spec.required;

	switch (spec.validate) {
		case "username":
			let match=/^[a-z0-9]+$/.exec(value);
			if (!match)
				return "Usernames can only have letters and numbers";
			break;

		case "email":
			if (value && !value.match(/^[^\s@]+@[^\s]+\.[^\s]+$/))
				return "This is not a valid email";
			break;

		case "password":
			if (value.length<6)
				return "The password is too short";
			break;
	}
}

export function validateForm(formData, spec) {
	let res={};

	for (let k in spec) {
		formData[k]=sanitizeFormValue(formData[k],spec[k]);
		let v=validateFormValue(formData[k],spec[k]);
		if (v)
			res[k]=v;
	}

	return res;
}

export function assertForm(formData, spec) {
	let res=validateForm(formData,spec);
	if (Object.keys(res).length) {
		let k=Object.keys(res)[0];
		let e=new Error(res[k]);
		e.field=k;

		throw e;
	}
}