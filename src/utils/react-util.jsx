import {useRef, useReducer, useState, useEffect, useLayoutEffect} from "preact/compat";
import {apiFetch} from "./web-util.js";

export function useForceUpdate() {
	const [_, forceUpdate] = useReducer((x) => x + 1, 0);

	return forceUpdate;
}

export function useApiFetch(url, options={}) {
	let ref=useRef();
	let [data,setData]=useState(null);

	if (!options.query)
		options.query={};

	function invalidate() {
		if (!url) {
			setData(null);
			return;
		}

		apiFetch(url,options.query)
			.then((d)=>{
				if (options.complete)
					options.complete(d);
				setData(d)
			});
	}

	if (!ref.current || ref.current!=url) {
		ref.current=url;
		invalidate();
	}

	return {data, invalidate};
}
