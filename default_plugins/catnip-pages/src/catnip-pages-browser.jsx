import {catnip, convertToSlug, useChannel} from "catnip";
import PageView from "../components/PageView.jsx";
import PageAdmin from "../components/PageAdmin.jsx";
import FILE_EARMARK_TEXT from "bootstrap-icons/icons/file-earmark-text.svg";

catnip.addElement("PageCounter",()=>{
	let numPages=useChannel("numPages");

	if (numPages===undefined)
		return "";

	return <div>Num pages: {numPages}</div>
});

catnip.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Pages",
		href: "/admin/page",
		priority: 40,
		icon: FILE_EARMARK_TEXT
	});
});

catnip.addRoute("admin/page",PageAdmin);
catnip.addRoute("page/*",PageView);
