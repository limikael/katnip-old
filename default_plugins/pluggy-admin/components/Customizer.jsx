import {pluggy, A, buildUrl, ItemForm, optionsFromObject, useSession, apiFetch} from "pluggy";
import {useState} from "preact/compat";
import FLOWER from "bootstrap-icons/icons/flower1.svg";
import GEAR from "bootstrap-icons/icons/gear.svg";
import {AdminHead} from "./AdminTemplate.jsx";

const whiteFilter="filter: invert(100%) sepia(19%) saturate(1%) hue-rotate(216deg) brightness(108%) contrast(102%);";

function Sidebar({request}) {
	function getThemeOptionKeys() {
		let keys=[];

		let customizerOptions=[];
		pluggy.doAction("getCustomizerOptions",customizerOptions);

		let customizerControls=[];
		for (let customizerOption of customizerOptions)
			keys.push(customizerOption.setting);

		return keys;
	}

	let [session, setSession]=useSession();

	let def={}
	for (let k of getThemeOptionKeys())
		def[k]=session[k];

	let [actual, setActual]=useState(def);
	let items=[];

	function onBackClick(ev) {
		ev.preventDefault();
		setSession(actual);
		pluggy.setLocation("/admin");
	}

	function read() {
		let o={};

		for (let k of getThemeOptionKeys())
			o[k]=session[k];

		return o;
	}

	async function write(values) {
		await apiFetch("/api/saveSettings",values);

		setActual(values);

		return "Saved.";
	}

	function onChange(values) {
		setSession(values);
	}

	let customizerOptions=[];
	pluggy.doAction("getCustomizerOptions",customizerOptions);

	let customizerControls=[];
	for (let customizerOption of customizerOptions) {
		customizerControls.push(
			<div class="form-group mb-3">
				<label class="form-label">{customizerOption.title}</label>
				<ItemForm.Input class="form-control" input="select"
						name={customizerOption.setting}>
					{optionsFromObject(customizerOption.options)}
				</ItemForm.Input>
			</div>
		);
	}

	return (
		<div class="d-flex flex-column text-white bg-dark p-2" style="width: 12rem; height: 100%">
			<h4 class="opacity-50 mb-1 mt-0">
				<img src={FLOWER} style={`width: 1.5rem; ${whiteFilter}`} class="align-middle ms-3 me-2"/>
				<span class="align-middle text-white">Admin</span>
			</h4>
			<hr class="mt-1"/>
			<a class="btn btn-secondary" onclick={onBackClick}>&lt;&lt; Back</a>
			<hr/>
			<div class="mb-auto">
				<ItemForm
						item={read}
						save={write}
						onchange={onChange}>

					{customizerControls}
					<ItemForm.Submit class="btn btn-primary mt-3">Save</ItemForm.Submit>
				</ItemForm>
			</div>
			<hr/>
		</div>
	);
}

export default function Customizer({request, children}) {
	return (
		<>
			<AdminHead />
			<div class="page d-flex flex-row">
				<div class="bootstrap-admin d-flex" style="height: 100%">
					<Sidebar request={request}/>
				</div>
				<div style="width: 100%">
					<div className="flex-grow-1">
						{children}
					</div>
				</div>
			</div>
		</>
	);
}