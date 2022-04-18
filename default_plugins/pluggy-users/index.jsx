import LoginPage from "./components/LoginPage.jsx";
import {ListUsers, EditUser} from "./components/UserAdmin.jsx";
import pluggy from "pluggy";
import User from "./model/User.js";

export function getAdminMenu(items) {
	items.push({
		title: "Users",
		href: "/admin/users",
		routes: ["/admin/user"],
		priority: 30
	});
}

export function getPageComponent(v, request) {
	switch (request.path) {
		case "/login":
			return LoginPage;

		case "/admin/users":
			return ListUsers;

		case "/admin/user":
			return EditUser;
	}
}

export const api={};

api.getAllUsers=async ()=>{
	return pluggy.db.User.findMany();
}

api.getUser=async ({id})=>{
//	console.log("getting user: "+id);
	let u=await pluggy.db.User.findOne({id: id});

	return u;
}

api.saveUser=async ({id, email, password})=>{
	let u;

	if (id)
		u=await pluggy.db.User.findOne({id: id});

	else
		u=new pluggy.db.User();

	u.role="subscriber";
	u.email=email;
	u.password=password;
	await u.save();

	return {id: u.id};
}

api.deleteUser=async ({id})=>{
	let u=await pluggy.db.User.findOne({id: id});
	await u.delete();
}

pluggy.addModel(User);