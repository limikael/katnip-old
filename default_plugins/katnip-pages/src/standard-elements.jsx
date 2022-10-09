import {katnip, A} from "katnip";

katnip.addElement("div",{
	controls: {
		class: {type: "textarea"},
		style: {type: "textarea"}
	}
});

function Heading({size, inner, outer, children}) {
	return (
		<h1 {...outer} {...inner}>{children}</h1>
	);
}

Heading.controls={
	size: {type: "select", options: [1,2,3,4,5,6]}
}

katnip.addElement("h",Heading);

function Link({href, outer, inner, children, renderMode}) {
	function onClick(ev) {
		if (renderMode=="editor")
			ev.preventDefault();
	}

	return <A onclick={onClick} href={href} {...outer} {...inner}>{children}</A>
}

Link.controls={
	href: {},
	class: {type: "textarea"}
}

function Img({src, outer, style, ...props}) {
	let cls=props.class;

	return <img src={src} style={style} class={cls} {...outer} />
}

Img.controls={
	src: {},
	class: {type: "textarea"},
	style: {type: "textarea"}
}

katnip.addElement("img",Img);

katnip.addElement("p");
katnip.addElement("b");
katnip.addElement("i");
katnip.addElement("a",Link);
katnip.addElement("br");
katnip.addElement("span");
katnip.addElement("ul");
katnip.addElement("li");
