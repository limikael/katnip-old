import pluggy, {A} from "pluggy";

// sidebars: https://getbootstrap.com/docs/5.0/examples/sidebars/#

function Nav() {
	return (
		<nav className="navbar navbar-expand-lg navbar-dark bg-dark py-0">
			<div className="container-fluid">
				<A className="navbar-brand ps-1" href="http://localhost:3000/">Admin</A>
			</div>
		</nav>
	);
}

function Sidebar({request}) {
	let items=pluggy.applyFilters("getAdminMenu",[]);

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
		<div class="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark pt-0" style="width: 280px;">
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
				href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"/>
			<style global jsx>{`
				html, body, .page {
					height: 100%;
				}
			`}</style>
			<script
				src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"/>
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
