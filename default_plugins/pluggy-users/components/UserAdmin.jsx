import pluggy, {A,AdminListTable} from "pluggy";

function ListUsers() {
	let users=pluggy.useApi("getAllUsers");

	let columns={
		email: {label: "E-Mail"},
		role: {label: "Role"}
	};

	return (
		<>
			<h1 class="d-inline-block">Users</h1>
			<A class="btn btn-outline-primary align-text-bottom ms-2 btn-sm">Add User</A>
			<AdminListTable
					items={users} 
					columns={columns}
					href="/admin/users"/>
		</>
	);
}

function EditUser() {
	return (
		<>
			<h1 class="d-inline-block">Edit User</h1>
		</>
	);
}

export default function UserAdmin({request}) {
	if (request.query.id)
		return <EditUser/>

	else
		return <ListUsers/>
}
