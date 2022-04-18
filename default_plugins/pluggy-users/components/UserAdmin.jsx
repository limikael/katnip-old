import pluggy, {A,AdminListTable,useApiForm,AdminMessages} from "pluggy";

export function ListUsers() {
	let users=pluggy.useApi("getAllUsers");
	let columns={
		email: {label: "E-Mail"},
		role: {label: "Role"}
	};

	async function onDelete(id) {
		await pluggy.apiFetch("/api/deleteUser",{id: id});
		window.forcePluggyUpdate();
	}

	return (
		<>
			<h1 class="d-inline-block">Users</h1>
			<A class="btn btn-outline-primary align-text-bottom ms-2 btn-sm"
					href="/admin/user">
				Add User
			</A>
			<AdminListTable
					items={users} 
					columns={columns}
					href="/admin/user"
					ondelete={onDelete}/>
		</>
	);
}

export function EditUser({request}) {
	let form=useApiForm({
		fetchUrl: "getUser",
		saveUrl: "saveUser",
	});

	return (
		<>
			<h1 class="mb-4">{form.isUpdate()?"Edit User":"Add New User"}</h1>
			<AdminMessages />
			<form {...form.formProps()} style="max-width: 40rem" disabled>
				<div class="container border rounded p-3">
					<div class="mb-3">
						<label class="form-label">Email</label>
						<input type="text" class="form-control" {...form.inputProps("email")}/>
					</div>
					<div class="mb-3">
						<label class="form-label">Password</label>
						<input type="text" class="form-control" {...form.inputProps("password")}/>
					</div>
					<button type="submit" class="btn btn-primary" {...form.submitProps()}>
						{form.isUpdate()?"Update User":"Create New User"}
					</button>
				</div>
			</form>
		</>
	);
}
