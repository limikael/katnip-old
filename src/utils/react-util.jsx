import {useRef, useReducer, useState, useEffect, useLayoutEffect} from "preact/compat";

export function useForceUpdate() {
	const [_, forceUpdate] = useReducer((x) => x + 1, 0);

	return forceUpdate;
}

export function buildUrl(base, vars) {
	for (let key in vars) {
		value=vars[key];
		let sep = (base.indexOf('?') > -1) ? '&' : '?';
		base=base+sep+key+'='+encodeURIComponent(value);
	}

	return base

}

export async function apiFetch(url, query={}) {
	url=buildUrl(url,query);

	let response=await fetch(url);
	let data=await response.json();

	return data;
}

export function useApiFetch(url, query={}) {
	let ref=useRef();
	let [data,setData]=useState(null);

	function invalidate() {
		fetch(url).then(async(response)=>{
			setData(await response.json());
		});
	}

	if (!ref.current) {
		ref.current=true;
		invalidate();
	}

	return {data, invalidate};
}
