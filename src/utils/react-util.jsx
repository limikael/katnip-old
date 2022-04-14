import {useRef, useReducer, useState, useEffect, useLayoutEffect} from "preact/compat";

export function useForceUpdate() {
	const [_, forceUpdate] = useReducer((x) => x + 1, 0);

	return forceUpdate;
}
