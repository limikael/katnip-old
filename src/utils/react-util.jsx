import {useRef, useReducer, useState, useEffect, useLayoutEffect} from "preact/compat";
import {apiFetch} from "./web-util.js";

export function useForceUpdate() {
	const [_, forceUpdate] = useReducer((x) => x + 1, 0);

	return forceUpdate;
}

export function useApiFetch(url, query={}) {
	let ref=useRef();
	let [data,setData]=useState(null);

	function invalidate() {
		apiFetch(url,query)
			.then((d)=>{
				setData(d)
			});
	}

	if (!ref.current) {
		ref.current=true;
		invalidate();
	}

	return {data, invalidate};
}
