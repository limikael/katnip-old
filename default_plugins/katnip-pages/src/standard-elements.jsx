import {katnip, A} from "katnip";

katnip.addElement("div",{
	controls: {
		class: {type: "textarea"},
		style: {type: "textarea"}
	}
});

function Heading({size, inner, outer, children, ...props}) {
	let H="h1";

	if (size)
		H="h"+size;

	return (
		<H {...outer} {...inner} class={props.class}>{children}</H>
	);
}

Heading.controls={
	size: {type: "select", options: {1:1,2:2,3:3,4:4,5:5,6:6}},
	class: {type: "textarea"},
}

katnip.addElement("h",Heading);

function Link({href, outer, inner, children, renderMode, ...props}) {
	function onClick(ev) {
		if (renderMode=="editor")
			ev.preventDefault();
	}

	return <A onclick={onClick} href={href} {...outer} {...inner} class={props.class}>{children}</A>
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

katnip.addElement("p",{
	controls: {
		class: {type: "textarea"}
	}
});
katnip.addElement("b");
katnip.addElement("i");
katnip.addElement("a",Link);
katnip.addElement("br");
katnip.addElement("span");
katnip.addElement("ul",{
	controls: {
		class: {type: "textarea"}
	}
});
katnip.addElement("li",{
	controls: {
		class: {type: "textarea"}
	}
});
