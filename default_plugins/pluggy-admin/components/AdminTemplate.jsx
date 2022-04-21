import {pluggy, A} from "pluggy";

// sidebars: https://getbootstrap.com/docs/5.0/examples/sidebars/#

function Nav() {
	let [session,setSession]=pluggy.useSession();

	if (!session.user) {
		pluggy.setLocation("/login");
		return;
	}

	async function onLogoutClick(ev) {
		let [session,setSession]=pluggy.useSession();
		ev.preventDefault();

		await pluggy.apiFetch("/api/logout");
		setSession({user: null});
		pluggy.setLocation("/login");
	}

	return (
		<nav className="navbar navbar-expand-lg navbar-dark bg-dark py-0">
			<div className="container-fluid">
				<A className="navbar-brand ps-1" href="http://localhost:3000/">Admin...</A>
				<span class="text-white">
					<b>{session.user.email}</b>&nbsp;
					<a class="text-white" href="#"
							onclick={onLogoutClick}>
						Logout
					</a>
				</span>
			</div>
		</nav>
	);
}

function Sidebar({request}) {
	let items=[];
	pluggy.doAction("getAdminMenu",items);

	items.sort((a,b)=>a.priority-b.priority);

	let menuItems=[];
	for (let item of items) {
		let cls="nav-link";

		if (item.href==request.path ||
				(item.routes && item.routes.includes(request.path)))
			cls+=" active";

		else
			cls+=" text-white";

		menuItems.push(
			<li class="nav-item">
				<A href={item.href} class={cls}	>
					{item.title}
				</A>
			</li>
		);
	}

	return (
		<div class="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark pt-0" style="width: 12rem;">
			<hr class="mt-1"/>
			<ul class="nav nav-pills flex-column mb-auto">
				{menuItems}
			</ul>
			<hr/>
		</div>
	);
}

export default function AdminTemplate({request, children}) {
	return (
		<>
			<link rel="stylesheet" 
				href="/public/bootstrap.min.css"/>
			<style global jsx>{`
				html, body, .page {
					height: 100%;
				}
			`}</style>
			<script
				src="/public/bootstrap.bundle.min.js"/>
			<div class="page d-flex flex-column">
				<Nav/>
				<div className="d-flex flex-row flex-grow-1">
					<Sidebar request={request}/>
					<div className="flex-grow-1 m-3">
						{children}
					</div>
				</div>
			</div>
		</>
	);
}
