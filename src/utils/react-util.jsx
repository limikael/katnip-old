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
