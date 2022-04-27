import {pluggy, A, AdminListTable, apiFetch, ItemForm, setLocation, buildUrl} from "pluggy";
import {useForm, useCounter, useApiFetch, useValueChanged} from "pluggy";
import {useRef, useState} from "preact/compat";

export function LoginPage() {
	const loginRef=useRef();
	const passwordRef=useRef();
	let [message, setMessage]=useState();
	let [session, setSession]=pluggy.useSession();

	async function onLoginClick() {
		setMessage();

		try {
			let u=await pluggy.apiFetch("/api/login",{
				login: loginRef.current.value,
				password: passwordRef.current.value
			});

			setSession(u);
			pluggy.setLocation("/admin");
		}

		catch (e) {
			setMessage(e.message);
		}
	}

	let messageEl;
	if (message)
		messageEl=(
			<div class="text-danger text-center"><b>{message}</b></div>
		);

	return (
		<div class="d-flex flex-row align-items-center" style="width: 100%; height: 100%">
			<div class="d-flex align-items-center flex-column" style="width: 100%">
				<div class="card border shadow">
					<div class="card-body">
						<h3 class="text-center mb-4">Login</h3>

						<form>
							<input type="text" class="form-control mb-3" placeholder="Username / Email" ref={loginRef}/>
							<input type="password" class="form-control mb-3" placeholder="Password" ref={passwordRef}/>
						</form>

						{messageEl}

						<button class="btn btn-primary mt-2" style="width: 100%"
								onclick={onLoginClick}>
							Login
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export function UserList() {
	let columns={
		email: {label: "E-Mail"},
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
			<AdminListTable
					items={getUsers} 
					columns={columns}
					href="/admin/user"
					ondelete={onDelete}/>
		</>
	);
}

export function UserEdit({request}) {
	let userId=request.query.id;

	async function read() {
		if (!userId)
			return {};

		return await apiFetch("/api/getUser",{id: userId});
	}

	async function write(data) {
		let saved=await apiFetch("/api/saveUser",data);
		setLocation(buildUrl("/admin/user",{id: saved.id}));

		return "Saved...";
	}

	return (
		<>
			<h1 class="mb-3">{userId?"Edit User":"Add New User"}</h1>
			<ItemForm
					style="max-width: 40rem"
					item={read}
					save={write}
					deps={[userId]}>
				<div class="container border rounded p-3 bg-light">
					<div class="mb-3">
						<label class="form-label">Email</label>
						<ItemForm.Input
								name="email"
								type="text"
								class="form-control"/>
					</div>
					<div class="mb-3">
						<label class="form-label">Password</label>
						<ItemForm.Input
								name="password"
								type="text"
								class="form-control"/>
					</div>
					<ItemForm.Submit class="btn btn-primary">
						{userId?"Update User":"Create New User"}
					</ItemForm.Submit>
				</div>
			</ItemForm>
		</>
	);
}

export function UserAdmin({request}) {
	if (request.query.id || request.query.new)
		return <UserEdit request={request}/>

	return <UserList request={request}/>
}
