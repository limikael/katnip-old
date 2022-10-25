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

	it("can validate required and email",()=>{
		let spec={
			username: {validate: "username", required: "You must enter a username"},
			email: {validate: "email", required: "You must provide an email"}
		};

		expect(()=>{
			assertForm({},spec);
		}).toThrow(new Error("You must enter a username"));

		let spec2={
			email: {validate: "email", required: "You must provide an email"}
		};

		expect(()=>{
			assertForm({username: "bla"},spec2);
		}).toThrow(new Error("You must provide an email"));

		expect(()=>{
			assertForm({email: "blipp"},spec2);
		}).toThrow(new Error("This is not a valid email"));

		let thrown=null;
		try {
			assertForm({email: "blipp"},spec2);
		}

		catch (e) {
			thrown=e;
		}

		expect(thrown.message).toEqual("This is not a valid email");
		expect(thrown.field).toEqual("email");
	});
});