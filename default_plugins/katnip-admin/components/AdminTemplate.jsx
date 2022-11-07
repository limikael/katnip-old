import {katnip, A, buildUrl, useCurrentUser, useChannel, Stylesheet, useTemplateContext} from "katnip";
import FLOWER from "bootstrap-icons/icons/flower1.svg";
import GEAR from "bootstrap-icons/icons/gear.svg";
import {Customizer, CustomizerSidebar} from "./Customizer.jsx";

const whiteFilter="filter: invert(100%) sepia(19%) saturate(1%) hue-rotate(216deg) brightness(108%) contrast(102%);";

function Nav() {
	let webSocketStatus=katnip.useWebSocketStatus();
	let user=useCurrentUser();

	async function onLogoutClick(ev) {
		ev.preventDefault();

		await katnip.apiFetch("/api/logout");
	}

	let userLink=buildUrl("/admin/user",{id: user.id});

	return (
		<nav className="navbar navbar-expand navbar-dark bg-dark py-0">
			<div className="container-fluid">
				<ul class="navbar-nav">
					<li class="nav-item">
						<A class="nav-link" href="/">
							Visit Site
						</A>
					</li>
				</ul>
				<ul class="navbar-nav ms-auto">
					<li class="nav-item">
						<A class="nav-link" href={userLink}>
							<b>{user.username}</b>
						</A>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="#"
								onclick={onLogoutClick}>
							Logout
						</a>
					</li>
				</ul>
				{!webSocketStatus && (
					<div>
						<div class="spinner-border text-muted spinner-border-sm" />
					</div>
				)}
			</div>
		</nav>
	);
}

function Sidebar({request}) {
	let items=[];
	katnip.doAction("getAdminMenu",items);

	items.sort((a,b)=>a.priority-b.priority);

	let menuItems=[];
	for (let item of items) {
		let cls="nav-link";

		if (item.href==request.pathname ||
				(item.routes && item.routes.includes(request.pathname)))
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
				<span class="align-middle">Katnip</span>
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
	let contentHash=useChannel("contentHash");

	let cssUrl=buildUrl("/bootstrap.min.css",{contentHash: contentHash});
	let jsUrl=buildUrl("/bootstrap.bundle.min.js",{contentHash: contentHash});

	return (<>
		<Stylesheet href={cssUrl}/>
		<style>{`
			html, body, .page, #katnip-root, #katnip-ssr {
				height: 100%;
				width: 100%;
				overflow-y: hidden;
			}
		`}</style>
		<script src={jsUrl}/>
	</>);
}

export default function AdminTemplate({request, children}) {
	let user=useCurrentUser();
	let tc=useTemplateContext();

	if (!user) {
		console.log("no user, redirecting");
		katnip.setLocation("/login");
		return;
	}

	let content;
	if (request.pathname=="/admin/customize")
		content=<Customizer request={request}/>;

	else {
		let m="p-3";
		if (tc.tight)
			m="";

		let contentStyle={
			width: "calc(100vw - 12rem)",
			height: "100%"
		};

		content=(<>
			<Sidebar request={request}/>
			<div style={contentStyle}>
				<Nav/>
				<div className={"flex-grow-1 "+m} style="height: calc( 100% - 40px )">
					{children}
				</div>
			</div>
		</>);
	}

	return (
		<>
			<AdminHead />
			<div class="page d-flex flex-row">
				{content}
			</div>
		</>
	);
}
