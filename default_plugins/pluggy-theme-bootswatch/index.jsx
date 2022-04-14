import PageTemplate from "./components/PageTemplate.jsx";
import BootswatchAdmin from "./components/BootswatchAdmin.jsx";
import NotFound from "./components/NotFound.jsx";

export function getAdminMenu(items) {
	items.push({
		title: "Bootswatch",
		href: "/admin/bootswatch",
		priority: 20
	});
}

export function getPageComponent(v, request) {
	if (request.path=="/admin/bootswatch")
		return BootswatchAdmin;

	if (!v)
		return NotFound;
}

export function getPageTemplate(v, request) {
	if (request.params[0]!="admin")
		return PageTemplate;
}
