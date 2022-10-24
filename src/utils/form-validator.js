export function sanitizeFormValue(value, spec={}) {
	if (!value)
		value="";

	switch (spec.validate) {
		case "username":
			value=value.replaceAll(/[\_\. ]/g,"");
			value=value.toLowerCase();
			break;
	}

	return value;
}

export function validateFormValue(value, spec={}) {
	switch (spec.validate) {
		case "username":
			let match=/^[a-z0-9]+$/.exec(value);
			if (!match)
				return "Usernames can only have letters and numbers";
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
	if (Object.keys(res).length)
		throw new Error(res[Object.keys(res)[0]]);
}