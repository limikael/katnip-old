import {A, catnip, useSession, useResizeObserver, useValueChanged} from "catnip";
import {useRef, useEffect, useState} from "preact/compat";

function Nav({request, onsize}) {
	let [session]=catnip.useSession();
	let brandRef=useRef();
	let navRef=useRef();
	let [reportedHeight,setReportedHeight]=useState(0);

	function getNavHeight() {
		if (!navRef.current)
			return;

		let navStyle=window.getComputedStyle(navRef.current);
		let padding=
			parseFloat(navStyle["padding-top"])+
			parseFloat(navStyle["padding-bottom"])+
			parseFloat(navStyle["border-bottom-width"]);
		let h=brandRef.current.clientHeight+padding;

		return h;
	}

	function checkHeight() {
		let currentHeight=getNavHeight();
		//console.log("current: "+currentHeight+" reported: "+reportedHeight);

		if (currentHeight!=reportedHeight) {
			reportedHeight=currentHeight;
			onsize(reportedHeight);
			setReportedHeight(reportedHeight);
		}

		setTimeout(checkHeight,0);
	}

	useResizeObserver(navRef,checkHeight);
	useEffect(checkHeight);

	let navColor=session.bootswatchNavColor;
	let navClass="navbar-dark ";
	if (navColor=="light")
		navClass="navbar-light ";

	navClass+=` bg-${navColor}`;
	if (session.bootswatchNavStyle=="fixed")
		navClass+=" fixed-top";

	return (
		<nav class={`navbar navbar-expand-md ${navClass}`} ref={navRef}>
			<div class="container">
				<A class="navbar-brand" href="/" ref={brandRef}>{session.sitename}</A>
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

function Footer({request}) {
	let [session]=catnip.useSession();

	let cls;
	switch (session.bootswatchFooter) {
		case "dark":
			cls="bg-dark text-light";
			break;

		case "light":
			cls="bg-light text-dark";
			break;

		case "black":
			cls="bg-black text-white";
			break;

		case "none":
			return;
			break;

		case "transparent":
		default:
			break;
	}


	return (
		<footer class={`container-fluid ${cls}`}>
			<div class="container pt-4 pb-4">
				<h4>{session.sitename}</h4>
				<ul>
					{session.menuFooter.map(item=>{
						return (
							<li>
								<A href={item.href}>
									{item.label}
								</A>
							</li>
						);
					})}
				</ul>
			</div>
		</footer>
	);
}

export function PageTemplate({request,children}) {
	let [session]=useSession();
	let [navSize,setNavSize]=useState();
	let newPage=useValueChanged(request.href);

	if (newPage) {
		setTimeout(()=>{
			let el=document.querySelector("nav .navbar-collapse");
			el.classList.remove("show");
		},0)
	}

	let cssUrl="/public/bootstrap.min.css";
	if (session.bootswatchTheme)
		cssUrl=`/public/bootstrap-${session.bootswatchTheme}.min.css`;

	let containerStyle={};
	if (session.bootswatchNavStyle=="fixed")
		containerStyle["margin-top"]=navSize+"px";

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
				<Nav request={request} onsize={setNavSize}/>
				<div class="container mb-5 flex-grow-1" style={containerStyle}>
					<div class="row" style="height: 100%">
						<div class="d-none d-lg-block" style="width: 12.5%"></div>
						<div class="col-lg-9">
							{children}
						</div>
					</div>
				</div>
				<Footer request={request} />
			</div>
		</>
	);
}