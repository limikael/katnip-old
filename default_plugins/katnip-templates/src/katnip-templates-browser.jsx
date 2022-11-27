import {katnip, lazyComponent, ContentContext} from "katnip";
import {useContext} from "react";
import LIST_NESTED from "bootstrap-icons/icons/list-nested.svg";
import FILE_EARMARK from "bootstrap-icons/icons/file-earmark.svg";

katnip.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Templates",
		href: "/admin/template",
		priority: 50,
		icon: FILE_EARMARK
	});

	/*items.push({
		title: "Taxonomies",
		href: "/admin/taxonomy",
		priority: 60,
		icon: LIST_NESTED
	});*/
});

katnip.addRoute("admin/taxonomy/*",lazyComponent("admin","TaxonomyAdmin"));
katnip.addRoute("admin/template",lazyComponent("admin","TemplateAdmin"));

katnip.addElement("TheContent",({renderMode})=>{
	let content=useContext(ContentContext);

	if (renderMode=="editor")
		return (
			<div class="p-5 text-center bg-light">(main content area)</div>
		);

	return content;
});

katnip.addRoute("/testroute",()=>{
	return (
		<div>hello, this is a the testroute</div>
	);
});