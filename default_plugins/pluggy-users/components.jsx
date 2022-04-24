import {pluggy, A, AdminListTable, AdminMessages, apiFetch} from "pluggy";
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
			<div class="d-flex align-items-center flex-column pb-5" style="width: 100%">
				<div class="card border shadow mb-3">
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
	let users=useApiFetch("/api/getAllUsers");
	let columns={
		email: {label: "E-Mail"},
		role: {label: "Role"}
	};

	async function onDelete(id) {
		await apiFetch("/api/deleteUser",{id: id});
		pluggy.dismissAdminMessages();
		pluggy.showAdminMessage("User deleted");
		invalidate();
	}

	return (
		<>
			<h1 class="d-inline-block">Users</h1>
			<A class="btn btn-outline-primary align-text-bottom ms-2 btn-sm"
					href="/admin/user">
				Add User
			</A>
			<AdminMessages />
			{users==undefined && <div class="spinner-border m-3"/>}
			<AdminListTable
					items={users} 
					columns={columns}
					href="/admin/user"
					ondelete={onDelete}/>
		</>
	);
}

export function UserEdit({request}) {
	let userId=request.query.id;
	let url=userId?"/api/getUser":null;
	let [counter,invalidate]=useCounter();
	let fetchResult=useApiFetch(url,{id: userId},[url,userId,counter]);
	let [current,field,modified]=useForm(fetchResult,[fetchResult,url]);
	let isUpdate=!!request.query.id;
	let loading=(userId && !fetchResult);
	let [saving,setSaving]=useState();
	let isFetchChanged=useValueChanged(fetchResult);

	if (fetchResult instanceof Error && isFetchChanged)
		pluggy.showAdminMessage(fetchResult);

	async function onSubmitClick(ev) {
		ev.preventDefault();
		setSaving(true);

		try {
			let successMessage=isUpdate?"User updated":"User created";
			pluggy.dismissAdminMessages();
			let res=await apiFetch("/api/saveUser",current);
			let url=pluggy.buildUrl("/admin/user",{id: res.id});
			pluggy.setLocation(url,{replace: true});
			pluggy.showAdminMessage(successMessage);
			invalidate();
		}

		catch (e) {
			pluggy.showAdminMessage(e);
		}

		setSaving(false);
	}

	return (
		<>
			<h1 class="d-inline-block">{isUpdate?"Edit User":"Add New User"}</h1>
			<AdminMessages />
			{loading && <div class="spinner-border m-3"/>}
			{!loading && !(fetchResult instanceof Error) &&
				<form style="max-width: 40rem" disabled>
					<div class="container border rounded p-3">
						<div class="mb-3">
							<label class="form-label">Email</label>
							<input type="text" class="form-control" {...field("email")}/>
						</div>
						<div class="mb-3">
							<label class="form-label">Password</label>
							<input type="text" class="form-control" {...field("password")}/>
						</div>
						<button type="submit" class="btn btn-primary" onclick={onSubmitClick}
								disabled={!modified || saving}>
							{saving && <span class="spinner-border spinner-border-sm me-2"/>}
							{isUpdate?"Update User":"Create New User"}
						</button>
					</div>
				</form>
			}
		</>
	);
}

export function UserAdmin({request}) {
	if (request.query.id || request.query.new)
		return <UserEdit request={request}/>

	return <UserList request={request}/>
}
