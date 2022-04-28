import {useRef, useReducer, useState, useEffect, useLayoutEffect, useMemo} from "preact/compat";
import {apiFetch} from "./js-util.js";

export function useForceUpdate() {
	const [_, forceUpdate] = useReducer((x) => x + 1, 1);

	return forceUpdate;
}

export function usePromise(fn, deps) {
	let [result,setResult]=useState();

	useMemo(async ()=>{
		setResult(undefined);

		try {
			setResult(await fn());
		}

		catch (e){
			console.log(e);
			setResult(e);
		}		
	},deps);

	return result;
}

export function useApiFetch(url, query={}, deps=[]) {
	//console.log("useFetch: "+url+" "+JSON.stringify(query)+" "+JSON.stringify(deps));

	let result=usePromise(async ()=>{
		if (!url)
			return url;

		try {
			return await apiFetch(url,query);
		}

		catch (e) {
			return e;
		}
	},deps);

	return result;
}

export function useRevertibleState(initial, deps=[]) {
	let [state,setState]=useState(initial);
	useMemo(()=>{
		setState(initial);
	},deps);

	return [state,setState,state!=initial];
}

export function useForm(initial, deps=[], options={}) {
	let [current,setCurrent,modified]=useRevertibleState(initial,deps);

	function onFieldChange(ev) {
		if (!current)
			current={};

		current[ev.target.dataset.field]=ev.target.value;
		setCurrent({...current});

		if (options.onchange)
			options.onchange(current);
	}

	function field(name) {
		if (!current)
			current={};

		return {
			value: current[name],
			onchange: onFieldChange,
			"data-field": name
		}
	}

	return [current,field,modified];
}

export function useCounter() {
	let res=useReducer((x) => x + 1, 1);

	return res;
}

export function useValueChanged(value) {
	let [state,setState]=useState(value);

	if (value!=state) {
		setState(value);
		return true;
	}

	return false;
}

export function optionsFromObject(o) {
	let options=[];

	for (let k in o)
		options.push(
			<option value={k}>{o[k]}</option>
		);

	return options;
}

export function useResizeObserver(ref, fn) {
	useEffect(()=>{
		let resizeObserver=new ResizeObserver(()=>{
			fn();
		});

		resizeObserver.observe(ref.current);
		return (()=>{
			resizeObserver.disconnect();
		});
	},[ref,ref.current]);
}

export function useEventUpdate(event, target=window) {
	let forceUpdate=useForceUpdate();

	useEffect(()=>{
		let updater=forceUpdate;

		target.addEventListener(event,updater);
		return (()=>{
			target.removeEventListener(event,updater);
		});
	},[target,event]);
}

export function useEventListener(event, target, updater) {
	useEffect(()=>{
		target.addEventListener(event,updater);
		return (()=>{
			target.removeEventListener(event,updater);
		});
	},[target,event]);
}
