import {katnip, A} from "katnip";

const CLASS_AND_STYLE={
	class: {type: "textarea"},
	style: {type: "textarea"}
};

function Heading({size, inner, outer, children, ...props}) {
	let H="h1";

	if (size)
		H="h"+size;

	return (
		<H {...outer} {...inner} class={props.class}>{children}</H>
	);
}

Heading.wrap=false;
Heading.controls={
	size: {type: "select", options: {1:1,2:2,3:3,4:4,5:5,6:6}},
	class: {type: "textarea"},
	style: {type: "textarea"}
}

function Link({href, outer, inner, children, renderMode, ...props}) {
	if (!href)
		href="";

	function onClick(ev) {
		if (renderMode=="editor")
			ev.preventDefault();
	}

	return (
		<A href={href} class={props.class} {...outer} {...inner} onclick={onClick}>{children}</A>
	);
}

Link.wrap=false;
Link.controls={
	href: {},
	class: {type: "textarea"},
	style: {type: "textarea"}
}

function Img({src, outer, style, ...props}) {
	let cls=props.class;

	return <img src={src} style={style} class={cls} {...outer} />
}

Img.wrap=false;
Img.controls={
	src: {},
	class: {type: "textarea"},
	style: {type: "textarea"}
}

katnip.addElement("div",{controls: CLASS_AND_STYLE});
katnip.addElement("p",{controls: CLASS_AND_STYLE});
katnip.addElement("h",Heading);
katnip.addElement("b");
katnip.addElement("i");
katnip.addElement("a",Link);
katnip.addElement("img",Img);
katnip.addElement("br");
katnip.addElement("span",{controls: CLASS_AND_STYLE});
katnip.addElement("ul",{controls: CLASS_AND_STYLE});
katnip.addElement("li",{controls: CLASS_AND_STYLE});
katnip.addElement("pre",{controls: CLASS_AND_STYLE});