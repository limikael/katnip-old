import PageTemplate from "./components/PageTemplate.jsx";
import BootswatchAdmin from "./components/BootswatchAdmin.jsx";
import NotFound from "./components/NotFound.jsx";
import pluggy from "pluggy";

pluggy.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Bootswatch",
		href: "/admin/bootswatch",
		priority: 20
	});
})

pluggy.addAction("getMenuLocations",(items)=>{
	items.push({
		title: "Header Menu",
		setting: "menuHeader"
	});

	items.push({
		title: "Footer Menu",
		setting: "menuFooter"
	});
})

pluggy.addAction("getPageComponent",(request)=>{
	if (request.path=="/admin/bootswatch")
		return BootswatchAdmin;
});

pluggy.addAction("getPageTemplate",(request)=>{
	if (request.params[0]!="admin")
		return PageTemplate;
});
