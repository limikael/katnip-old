import {pluggy, A, buildUrl, ItemForm, optionsFromObject, useSession, apiFetch} from "pluggy";
import {useState, useRef, useEffect} from "preact/compat";
import FLOWER from "bootstrap-icons/icons/flower1.svg";
import GEAR from "bootstrap-icons/icons/gear.svg";
import {AdminHead} from "./AdminTemplate.jsx";

const whiteFilter="filter: invert(100%) sepia(19%) saturate(1%) hue-rotate(216deg) brightness(108%) contrast(102%);";

function getThemeOptionKeys() {
	let keys=[];

	let customizerOptions=[];
	pluggy.doAction("getCustomizerOptions",customizerOptions);

	let customizerControls=[];
	for (let customizerOption of customizerOptions)
		keys.push(customizerOption.setting);

	return keys;
}

function getThemeOptionsFromSession(session) {
	let values={};
	for (let k of getThemeOptionKeys())
		values[k]=session[k];

	return values;
}

export function CustomizerSidebar({request, iframeRef}) {
	let [session, setSession]=useSession();
	let [viewSettings, setViewSettings]=useState(getThemeOptionsFromSession(session));
	let items=[];

	function postValues(values) {
		iframeRef.current.contentWindow.postMessage({
			type: "setSession",
			values: values
		});
	}

	function onLoad() {
		postValues(viewSettings);
	}

	useEffect(()=>{
		let el=iframeRef.current.contentWindow;
		el.addEventListener("load",onLoad);

		return (()=>{
			el.removeEventListener("load",onLoad)
		});
	},[]);

	function onBackClick(ev) {
		ev.preventDefault();
		pluggy.setLocation("/admin");
	}

	function read() {
		return getThemeOptionsFromSession(session);
	}

	async function write(values) {
		await apiFetch("/api/saveSettings",values);
		setSession(values);
		return "Saved.";
	}

	function onChange(values) {
		setViewSettings(values);
		postValues(values);
	}

	let customizerOptions=[];
	pluggy.doAction("getCustomizerOptions",customizerOptions);

	let customizerControls=[];
	for (let customizerOption of customizerOptions) {
		customizerControls.push(
			<div class="form-group mb-3">
				<label class="form-label">{customizerOption.title}</label>
				<ItemForm.Input class="form-select bg-light" input="select"
						name={customizerOption.setting}>
					{optionsFromObject(customizerOption.options)}
				</ItemForm.Input>
			</div>
		);
	}

	return (
		<div class="d-flex flex-column flex-shrink-0 text-white bg-dark p-2" style="width: 12rem;">
			<h4 class="opacity-50 mb-1 mt-0">
				<img src={FLOWER} style={`width: 1.5rem; ${whiteFilter}`} class="align-middle ms-3 me-2"/>
				<span class="align-middle text-white">Catnip</span>
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

export function Customizer({request, children}) {
	iframeRef=useRef();

	return (
		<>
			<CustomizerSidebar request={request} iframeRef={iframeRef}/>
			<div style="width: 100%">
				<iframe src="/" width="100%" height="100%" style="width: 100%" ref={iframeRef}/>
			</div>
		</>
	);
}