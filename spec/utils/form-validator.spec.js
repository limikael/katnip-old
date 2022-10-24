import {validateFormValue, sanitizeFormValue, validateForm, assertForm} from "../../src/utils/form-validator.js";

describe("form-validator",()=>{
	it("can validate single form data",()=>{
		let x;

		x=validateFormValue("hello",{validate: "username"});
		expect(x).toEqual(undefined);

		x=validateFormValue("hello**",{validate: "username"});
		expect(x).toEqual("Usernames can only have letters and numbers");

		x=validateFormValue("hello_",{validate: "username"});
		expect(x).toEqual("Usernames can only have letters and numbers");

		let spec={validate: "username"};
		x=validateFormValue(sanitizeFormValue("hello_",spec),spec);
		expect(x).toEqual(undefined);
	});

	it("can validate more form data",()=>{
		let formData={
			username: "hell_o",
		}

		let spec={
			username: {validate: "username"}
		}

		let r=validateForm(formData,spec);
		/*console.log(formData);
		console.log(r);*/

		assertForm(formData,spec);
		//console.log(formData);
	});
});