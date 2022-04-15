import {useRef, useReducer, useState, useEffect, useLayoutEffect} from "preact/compat";

export function useForceUpdate() {
	const [_, forceUpdate] = useReducer((x) => x + 1, 0);

	return forceUpdate;
}

export function buildUrl(base, key, value) {
	let sep = (base.indexOf('?') > -1) ? '&' : '?';
	return base + sep + key + '=' + encodeURIComponent(value);
}
