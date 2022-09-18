import {useRef, useReducer, useState, useEffect, useLayoutEffect, useMemo, useCallback} from "preact/compat";
import {apiFetch} from "./js-util.js";

export function useForceUpdate() {
	const [_, forceUpdate] = useReducer((x) => x + 1, 1);

	return forceUpdate;
}

export function useInstance(cls, ...params) {
	let ref=useRef();

	if (!ref.current)
		ref.current=new cls(...params);

	return ref.current;
}

export function usePromise(fn, deps) {
	let [result,setResult]=useState();

	useMemo(async ()=>{
		try {
			if (typeof fn=="function") {
				setResult(undefined);
				result=undefined;
				result=await fn();
			}

			else {
				result=fn;
			}

			setResult(result);
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

/*export function useForm() {
	throw new Error("wrong");
}*/

/*export function useForm(getInitial, deps=[], options={}) {
	if (!getInitial)
		getInitial={};

	let initial=usePromise(getInitial,deps);
	let [current,setCurrent,modified]=useRevertibleState(initial,[...deps,initial]);

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

		let v=current[name];
		if (!v)
			v="";

		return {
			value: v,
			onchange: onFieldChange,
			"data-field": name
		}
	}

	return [current,field,modified];
}*/

export function useCounter() {
	let res=useReducer((x) => x + 1, 1);

	return res;
}

export function useValueChanged(value) {
	let ref=useRef(value);

	if (Array.isArray(value) && Array.isArray(ref.current)) {
		function depsDiff(deps1, deps2) {
			return !((Array.isArray(deps1) && Array.isArray(deps2)) &&
				deps1.length === deps2.length &&
				deps1.every((dep, idx) => Object.is(dep, deps2[idx]))
			);
		}

		if (depsDiff(ref.current,value)) {
			ref.current=[...value];
			return true;
		}
	}

	else if (value!=ref.current) {
		ref.current=value;
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


export function useImmediateEffect(effect, deps) {
	const cleanupRef = useRef();
	const depsRef = useRef();

	function depsDiff(deps1, deps2) {
		return !((Array.isArray(deps1) && Array.isArray(deps2)) &&
			deps1.length === deps2.length &&
			deps1.every((dep, idx) => Object.is(dep, deps2[idx]))
		);
	}

	if (!depsRef.current || depsDiff(depsRef.current, deps)) {
		depsRef.current = deps;

		if (cleanupRef.current) {
			cleanupRef.current();
		}

		cleanupRef.current = effect();
	}

	useEffect(() => {
		return () => {
			if (cleanupRef.current) {
				cleanupRef.current();
			}
		};
	}, []);
};

export function useEventListener(event, target, func) {
	useImmediateEffect(()=>{
		function onEvent(...params) {
			func(...params);
		}

		if (target) {
			if (target.on)
				target.on(event,onEvent);

			else if (target.addEventListener)
				target.addEventListener(event,onEvent);

			else throw new Error("not an event dispatcher");

			return (()=>{
				if (target.off)
					target.off(event,onEvent);

				else if (target.removeEventListener)
					target.removeEventListener(event,onEvent);

				else throw new Error("not an event dispatcher");
			});
		}
	},[target,event]);
}

export function useEventUpdate(event, target=window) {
	let forceUpdate=useForceUpdate();
	useEventListener(event,target,forceUpdate);
}

export function useModal() {
	let forceUpdate=useForceUpdate();
	let ref=useRef({});

	function show(modal) {
		ref.modal=modal;
		let p=new Promise((resolve, reject)=>{
			ref.resolve=resolve;
			ref.reject=reject;
		});

		forceUpdate();
		return p;
	}

	function resolve(v) {
		ref.resolve(v);
		ref.modal=null;
		ref.resolve=null;
		ref.reject=null;
		forceUpdate();
	}

	function reject(v) {
		ref.reject(v);
		ref.modal=null;
		ref.resolve=null;
		ref.reject=null;
		forceUpdate();
	}

	return [ref.modal, show, resolve, reject];
}
