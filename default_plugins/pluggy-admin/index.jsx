import pluggy from "pluggy";
import AdminTemplate from "./components/AdminTemplate.jsx";

export function getAdminMenu(items) {
	items.push({
		title: "Dashboard",
		href: "/admin",
		priority: 10
	});
}

export function getPageTemplate(val, request) {
	if (request.params[0]=="admin")
		return AdminTemplate;
}
