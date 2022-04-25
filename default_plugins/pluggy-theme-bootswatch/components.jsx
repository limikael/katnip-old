import {A, pluggy, useSession} from "pluggy";

function Nav({request}) {
	let [session, setSession]=pluggy.useSession();

	return (
		<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
			<div class="container-fluid">
				<A class="navbar-brand" href="/">My Site</A>
				<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
					<span class="navbar-toggler-icon"></span>
				</button>

				<div class="collapse navbar-collapse" id="navbarColor01">
					<ul class="navbar-nav me-auto">
						{session.menuHeader.map(item=>{
							let cls="nav-link";

							if (request.path==item.href)
								cls+=" active";

							return (
								<li class="nav-item">
									<A class={cls} href={item.href}>
										{item.label}
									</A>
								</li>
							);
						})}
					</ul>
				</div>
			</div>
		</nav>
	);
}

export function PageTemplate({request,children}) {
	let [session]=useSession();

	let cssUrl="/public/bootstrap.min.css";
	if (session.bootswatchTheme)
		cssUrl=`/public/bootstrap-${session.bootswatchTheme}.min.css`;


	return (
		<>
			<link rel="stylesheet" href={cssUrl}/>
			<script
				src="/public/bootstrap.bundle.min.js"
				async
			/>
			<style global jsx>{`
				html, body, .page {
					height: 100%;
				}
			`}</style>
			<div class="page d-flex flex-column">
				<Nav request={request}/>
				<div class="container mt-3 flex-grow-1">
					{children}
				</div>
			</div>
		</>
	);
}
