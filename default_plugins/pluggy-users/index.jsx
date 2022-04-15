import LoginPage from "./components/LoginPage.jsx";
import UserAdmin from "./components/UserAdmin.jsx";

export function getAdminMenu(items) {
	items.push({
		title: "Users",
		href: "/admin/users",
		priority: 30
	});
}

export function getPageComponent(v, request) {
	switch (request.path) {
		case "/login":
			return LoginPage;

		case "/admin/users":
			return UserAdmin;
	}
}

export const api={};

api.getAllUsers=async ()=>{
	return [
		{"id": 1, "email": "li.mikael@gmail.com","role": "admin","name": "Micke"},
		{"id": 2, "email": "li.mikael+1@gmail.com","role": "subscriber","name": "Micke2"},
		{"id": 3, "email": "li.mikael+2@gmail.com","role": "subscriber","name": "Micke3"}
	]
}