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

katnip.addElement("Box",()=><>
	<div class="bg-primary p-5">
		I'm a box
	</div>
</>);

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
