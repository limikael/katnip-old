import {catnip, A, ItemList, apiFetch, setLocation, buildUrl} from "catnip";
import {useForm, useCounter, useApiFetch, useValueChanged} from "catnip";
import {BsInput, PromiseButton} from "catnip";
import {useRef, useState} from "preact/compat";
import {getRoles} from "../src/rolecaps.js";

export function UserList() {
	let columns={
		id: {label: "User ID"},
		role: {label: "Role"}
	};

	async function getUsers() {
		return await apiFetch("/api/getAllUsers");
	}

	async function onDelete(id) {
		await apiFetch("/api/deleteUser",{id: id});
		return "Deleted";
	}

	return (
		<>
			<div>
				<h1 class="d-inline-block mb-3">Users</h1>
				<A class="btn btn-outline-primary align-text-bottom ms-2 btn-sm"
						href="/admin/user?new=1">
					Add User
				</A>
			</div>
			<ItemList
					items={getUsers} 
					columns={columns}
					href="/admin/user"
					ondelete={onDelete}/>
		</>
	);
}

export function UserEdit({request}) {
	let [message, setMessage]=useState();
	let userId=request.query.id;

	async function read() {
		if (!userId)
			return {};

		return await apiFetch("/api/getUser",{id: userId});
	}

	let [data, field]=useForm(read,[userId]);

	async function write() {
		let saved=await apiFetch("/api/saveUser",data);
		setLocation(buildUrl("/admin/user",{id: saved.id}));

		return "Saved...";
	}

	let roleOptions={};
	roleOptions[""]="";
	for (let role of getRoles())
		roleOptions[role]=role;

	return (
		<>
			<h1 class="mb-3">{userId?"Edit User":"Add New User"}</h1>
			<form
					style="max-width: 40rem"
					item={read}
					save={write}
					deps={[userId]}>
				<div class="container border rounded p-3 bg-light">
					<div class="mb-3">
						<label class="form-label">User ID</label>
						<BsInput type="text" disabled value={userId}/>
					</div>
					<div class="mb-3">
						<label class="form-label">Role</label>
						<BsInput type="select"
								options={roleOptions}
								{...field("role")}/>
					</div>
					<PromiseButton class="btn btn-primary" onclick={write}>
						{userId?"Update User":"Create New User"}
					</PromiseButton>
				</div>
			</form>
		</>
	);
}

export default function UserAdmin({request}) {
	if (request.query.id || request.query.new)
		return <UserEdit request={request}/>

	return <UserList request={request}/>
}
