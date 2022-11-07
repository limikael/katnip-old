import {katnip, A, buildUrl, useForm, BsInput, PromiseButton, optionsFromObject, apiFetch,
		useEventListener} from "katnip";
import {useState, useRef, useEffect} from "react";
import FLOWER from "bootstrap-icons/icons/flower1.svg";
import GEAR from "bootstrap-icons/icons/gear.svg";
import {AdminHead} from "./AdminTemplate.jsx";

const whiteFilter="filter: invert(100%) sepia(19%) saturate(1%) hue-rotate(216deg) brightness(108%) contrast(102%);";

function getThemeOptionKeys() {
	let keys=[];

	let customizerOptions=[];
	katnip.doAction("getCustomizerOptions",customizerOptions);

	let customizerControls=[];
	for (let customizerOption of customizerOptions)
		keys.push(customizerOption.setting);

	return keys;
}

function getThemeOptionsFromSession() {
	let values={};
	for (let k of getThemeOptionKeys())
		values[k]=katnip.getChannelValue(k);

	return values;
}

export function CustomizerSidebar({request, iframeRef}) {
	let form=useForm({initial: getThemeOptionsFromSession});

	function postValues() {
		iframeRef.current.contentWindow.postMessage({
			type: "setSession",
			values: form.getCurrent()
		});
	}

	useEventListener(form,"change",postValues);
	useEffect(()=>{
		let el=iframeRef.current.contentWindow;
		el.addEventListener("load",postValues);

		return (()=>{
			el.removeEventListener("load",postValues)
		});
	},[iframeRef.current,iframeRef.current?.contentWindow]);

	function onBackClick(ev) {
		ev.preventDefault();
		katnip.setLocation("/admin");
	}

	async function write() {
		await apiFetch("/api/saveSettings",form.getCurrent());
		for (let k in form.getCurrent()) {
			katnip.setChannelPersistence(k,true);
			katnip.setChannelValue(k,form.getCurrent()[k]);
		}
	}

	let customizerOptions=[];
	katnip.doAction("getCustomizerOptions",customizerOptions);

	let customizerControls=[];
	for (let customizerOption of customizerOptions) {
		customizerControls.push(
			<div class="form-group mb-3">
				<label class="form-label mb-1">{customizerOption.title}</label>
				<BsInput class="bg-light" type="select"
						{...form.field(customizerOption.setting)}
						options={customizerOption.options}/>
			</div>
		);
	}

	return (
		<div class="d-flex flex-column flex-shrink-0 text-white bg-dark p-2" style="width: 12rem;">
			<h4 class="opacity-50 mb-1 mt-0">
				<img src={FLOWER} style={`width: 1.5rem; ${whiteFilter}`} class="align-middle ms-3 me-2"/>
				<span class="align-middle text-white">Katnip</span>
			</h4>
			<hr class="mt-1"/>
			<a class="btn btn-secondary" onclick={onBackClick}>&lt;&lt; Back</a>
			<hr/>
			<div class="mb-auto">
				{customizerControls}
				<PromiseButton class="btn btn-primary mt-3" onclick={write}>
					Save
				</PromiseButton>
			</div>
			<hr/>
		</div>
	);
}

export function Customizer({request, children}) {
	let iframeRef=useRef();

	return (
		<>
			<CustomizerSidebar request={request} iframeRef={iframeRef}/>
			<div style="width: 100%; height: 100%"><iframe src="/" width="100%" height="100%" style="width: 100%; height: 100%" ref={iframeRef}/></div>
		</>
	);
}