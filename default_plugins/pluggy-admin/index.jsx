import pluggy from "pluggy";
import AdminTemplate from "./components/AdminTemplate.jsx";

pluggy.addAction("getPageTemplate",(request)=>{
	if (request.params[0]=="admin")
		return AdminTemplate;
});


pluggy.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Dashboard",
		href: "/admin",
		priority: 10
	});
});

function Hello() {
	return (
		<div>hello</div>
	);
}

pluggy.addAction("getPageComponent",(request)=>{
	if (request.path=="/admin")
		return Hello;
});
