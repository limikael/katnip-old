import {addElement, useChannel} from "katnip";

function PageCounter({outer, ...props}) {
	let numPages=useChannel("numPages");

	return <span {...outer} class={props.class} style={props.style}>{numPages}</span>
}

PageCounter.wrap="div";
PageCounter.controls={
	class: {},
	style: {}
};

addElement("PageCounter",PageCounter);
