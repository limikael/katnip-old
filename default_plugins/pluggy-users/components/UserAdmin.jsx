import pluggy, {A} from "pluggy";

export default function UserAdmin() {
	let users=pluggy.useApi("getAllUsers");

	console.log(users);

	return (
		<>
			<h1 class="d-inline-block">Users</h1>
			<A class="btn btn-outline-primary align-text-bottom ms-2 btn-sm">Add User</A>
			<table class="table mt-3 table-hover">
				<thead>
					<tr class="table-light">
						<th scope="col">Id</th>
						<th scope="col">Email</th>
						<th scope="col">Role</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Hello</td>
					</tr>
				</tbody>
			</table>
		</>
	);
}
