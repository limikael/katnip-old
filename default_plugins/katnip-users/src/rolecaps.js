const roles={
	"admin": ["creator","manage-users","manage-settings"],
	"creator": ["user","manage-content","access-admin"],
	"user": []
};

export function getCapsByRole(role) {
	let res=[role];

	if (roles[role])
		for (let cap of roles[role])
			res=[...res,...getCapsByRole(cap)];

	return res;
}

export function getRoles() {
	return Object.keys(roles);
}