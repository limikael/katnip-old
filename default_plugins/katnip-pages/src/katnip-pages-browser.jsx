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

function Box({label, color, round}) {
	if (!color)
		color="#f00";

	let rad="1em";
	if (round=="much")
		rad="2em";

	return <>
		<div class="p-5" style={{"background-color": color, "border-radius": rad}}>
			I'm a box: {label}
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
