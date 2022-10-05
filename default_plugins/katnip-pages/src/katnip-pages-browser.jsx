import {katnip, convertToSlug, useChannel} from "katnip";
import PageView from "../components/PageView.jsx";
import PageAdmin from "../components/PageAdmin.jsx";
import FILE_EARMARK_TEXT from "bootstrap-icons/icons/file-earmark-text.svg";

//katnip.setChannelPersistence("numPages",true);

katnip.addElement("PageCounter",()=>{
	let numPages=useChannel("numPages");

	if (numPages===undefined)
		return "";

	return <div>Num pages: {numPages}</div>
});

function Box({label, color, round, children}) {
	if (!color)
		color="#f00";

	let rad="1em";
	if (round=="much")
		rad="2em";

	return <>
		<div class="p-5 component" style={{"background-color": color, "border-radius": rad}}>
			<span>I'm a box: {label}</span>
			<div class="border child-container">
				{children}
			</div>
		</div>
	</>;
};

katnip.addElement("Box",Box,{
	controls: {
		label: {title: "The Label"},
		color: {title: "The Color"},
		round: {title: "Rounded", type: "select", "options": {little: "Little", much: "Much"}}
	}
});

function MyComp({label, children, ...props}) {
	return (<>
		<div class="bg-primary p-3 component">
			<div class="bg-light p-3">
				<b>hello world, don't edit</b><br/>
				<b>{label}</b>
				<div class="border p-3 child-container">
					{children}
				</div>
			</div>
		</div>
	</>)
}

katnip.addElement("MyComp",MyComp,{
	controls: {
		label: {title: "The Label"},
	}	
});

function Heading({children}) {
	let empty;
	if (!children || !children.length)
		empty=<span class="text-muted">&lt;Empty Heading&gt;</span>;

	return <h2 class="component">{empty}<span class="child-container">{children}</span></h2>
}

katnip.addElement("Heading",Heading);

function Paragraph({children}) {
	let empty;
	if (!children || !children.length)
		empty=<span class="text-muted">&lt;Empty Paragraph&gt;</span>;

	return <p class="component">{empty}<span class="child-container">{children}</span></p>
}

katnip.addElement("Bold",({children})=>{
	return <span class="component"><b><span class="child-container">{children}</span></b></span>
});


katnip.addElement("Paragraph",Paragraph);

katnip.addElement("Div","div");

katnip.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Pages",
		href: "/admin/page",
		priority: 40,
		icon: FILE_EARMARK_TEXT
	});
});

katnip.addRoute("admin/page",PageAdmin);
katnip.addRoute("page/*",PageView);
