import {A, catnip, useChannel, useResizeObserver, useValueChanged, useTemplateContext, buildUrl} from "catnip";
import {useRef, useEffect, useState} from "preact/compat";

function Nav({request, onsize}) {
	let webSocketStatus=catnip.useWebSocketStatus();
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
	}

	useResizeObserver(navRef,checkHeight);
	useEffect(()=>{
		checkHeight();
		setTimeout(checkHeight,0);
	},[]);

	let navColor=useChannel("bootswatchNavColor");
	let navStyle=useChannel("bootswatchNavStyle");
	let menuHeader=useChannel("menuHeader");
	let sitename=useChannel("sitename");

	if (!navColor)
		navColor="primary";

	let navClass="navbar-dark ";
	if (navColor=="light")
		navClass="navbar-light ";

	navClass+=` bg-${navColor}`;
	if (navStyle=="fixed")
		navClass+=" fixed-top";

	if (!menuHeader)
		menuHeader=[];

	return (
		<nav class={`navbar navbar-expand-md ${navClass}`} ref={navRef}>
			<div class="container">
				<A class="navbar-brand" href="/" ref={brandRef}>{sitename}</A>

				<button class="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse"
						data-bs-target="#navbarColor01"
						aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
					<span class="navbar-toggler-icon"></span>
				</button>

				<div class="collapse navbar-collapse" id="navbarColor01">
					<ul class="navbar-nav me-auto">
						{menuHeader.map(item=>{
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

				{!webSocketStatus && (
					<div class="ms-3">
						<div class="spinner-border text-light spinner-border-sm" />
					</div>
				)}
			</div>
		</nav>
	);
}

function Footer({request}) {
	let menuFooter=useChannel("menuFooter");
	let sitename=useChannel("sitename");
	let bootswatchFooter=useChannel("bootswatchFooter")

	let cls;
	switch (bootswatchFooter) {
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
			break;

		case "dark":
			default:
			cls="bg-dark text-light";
			break;
	}

	if (!menuFooter)
		menuFooter=[];

	return (
		<footer class={`container-fluid ${cls}`}>
			<div class="container pt-4 pb-4">
				<h4>{sitename}</h4>
				<ul>
					{menuFooter.map(item=>{
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

export default function BootswatchPageTemplate({request,children}) {
	let [navSize,setNavSize]=useState();
	let newPage=useValueChanged(request.href);
	let tc=useTemplateContext();
	let bootswatchTheme=useChannel("bootswatchTheme");
	let bootswatchNavStyle=useChannel("bootswatchNavStyle");
	let contentHash=useChannel("contentHash");

	if (newPage) {
		setTimeout(()=>{
			let el=document.querySelector("nav .navbar-collapse");
			el.classList.remove("show");
		},0)
	}

	let cssUrl="/public/bootstrap.min.css";
	if (bootswatchTheme)
		cssUrl=`/public/bootstrap-${bootswatchTheme}.min.css`;

	cssUrl=buildUrl(cssUrl,{contentHash: contentHash});

	let containerStyle={};
	if (bootswatchNavStyle=="fixed")
		containerStyle["margin-top"]=navSize+"px";

	let bsUrl=buildUrl("/public/bootstrap.bundle.min.js",{contentHash: contentHash});

	let topItems=[];
	catnip.doAction("topItems",topItems,request);

	return (
		<>
			<link rel="stylesheet" href={cssUrl}/>
			<script
				src={bsUrl}
				async
			/>
			<style global jsx>{`
				html, body, .page {
					height: 100%;
				}
			`}</style>
			<div class="page d-flex flex-column">
				<Nav request={request} onsize={setNavSize}/>
				<div style={containerStyle} class="flex-grow-1">
					{topItems}
					<div class="container mb-5">
						<div class="row" style="height: 100%">
							<div class="d-none d-lg-block" style="width: 12.5%"></div>
							<div class="col-lg-9">
								{tc && tc.title &&
									<h1 class="mt-5 pb-2 border-bottom mb-4">{tc.title}</h1>
								}
								{(!tc || !tc.title) &&
									<div class="mt-3"></div>
								}
								{children}
							</div>
						</div>
					</div>
				</div>
				<Footer request={request} />
			</div>
		</>
	);
}
