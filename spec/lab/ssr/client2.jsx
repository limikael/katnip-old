import {useRef, useState} from "preact/compat";
import {render} from 'preact-render-to-string';
import {createElement} from "preact";

export function Hello() {
	let ref=useRef();
	console.log(ref.current);

	ref.current=123;

	/*let [x,y]=useState();*/

	return <div>test</div>
}

export function run() {
	let html1=render(createElement(Hello),{});
	let html2=render(createElement(Hello),{});
	console.log(html1);
}
