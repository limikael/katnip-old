import {pluggy, A, buildUrl} from "pluggy";
import FLOWER from "bootstrap-icons/icons/flower1.svg";
import GEAR from "bootstrap-icons/icons/gear.svg";
import {Customizer, CustomizerSidebar} from "./Customizer.jsx";

const whiteFilter="filter: invert(100%) sepia(19%) saturate(1%) hue-rotate(216deg) brightness(108%) contrast(102%);";

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

	let userLink=buildUrl("/admin/user",{id: session.user.id});

	return (
		<nav className="navbar navbar-expand navbar-dark bg-dark py-0">
			<div className="container-fluid">
				<ul class="navbar-nav ms-auto">
					<li class="nav-item">
						<A class="nav-link" href={userLink}>
							<b>{session.user.email}</b>
						</A>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="#"
								onclick={onLogoutClick}>
							Logout
						</a>
					</li>
				</ul>
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

		let icon=GEAR;
		if (item.icon)
			icon=item.icon;

		menuItems.push(
			<li class="nav-item">
				<A href={item.href} class={cls}	>
					<img src={icon} class="me-2 align-middle" style={`height: 1em; ${whiteFilter}`}/>
					<span class="align-middle">{item.title}</span>
				</A>
			</li>
		);
	}

	return (
		<div class="d-flex flex-column flex-shrink-0 text-white bg-dark p-2" style="width: 12rem;">
			<h4 class="opacity-50 mb-1 mt-0">
				<img src={FLOWER} style={`width: 1.5rem; ${whiteFilter}`} class="align-middle ms-3 me-2"/>
				<span class="align-middle">Catnip</span>
			</h4>
			<hr class="mt-1"/>
			<ul class="nav nav-pills flex-column mb-auto">
				{menuItems}
			</ul>
			<hr/>
		</div>
	);
}

export function AdminHead() {
	return (<>
		<link rel="stylesheet" 
			href="/public/bootstrap.min.css"/>
		<style>{`
			html, body, .page {
				height: 100%;
				width: 100%;
			}
		`}</style>
		<script
			src="/public/bootstrap.bundle.min.js"/>
	</>);
}

export default function AdminTemplate({request, children}) {
	let content;
	if (request.path=="/admin/customize")
		content=<Customizer request={request}/>;

	else
		content=(<>
			<Sidebar request={request}/>
			<div style="width: 100%">
				<Nav/>
				<div className="flex-grow-1 m-3">
					{children}
				</div>
			</div>
		</>);

	return (
		<>
			<AdminHead />
			<div class="page d-flex flex-row">
				{content}
			</div>
		</>
	);
}
