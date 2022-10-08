import {katnip} from "katnip";

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

katnip.addElement("h",Heading,{children: ["hello"]});

katnip.addElement("p");
katnip.addElement("b");
katnip.addElement("i");
katnip.addElement("a");
katnip.addElement("br");
katnip.addElement("ul");
katnip.addElement("li");
