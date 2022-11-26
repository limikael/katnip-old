import {A, katnip, useChannel, useResizeObserver, useValueChanged, useTemplateContext, buildUrl, Stylesheet} from "katnip";
import {useRef, useEffect, useState} from "preact/compat";

function Nav({request, onsize, renderMode}) {
	let webSocketStatus=katnip.useWebSocketStatus();
	let navRef=useRef();
	let collapseRef=useRef();
	let [reportedHeight,setReportedHeight]=useState(0);

	let newPage=useValueChanged(request.href);
	if (newPage) {
		setTimeout(()=>{
			let el=document.querySelector("nav .navbar-collapse");
			if (el)
				el.classList.remove("show");
		},0)
	}

	function getNavHeight() {
		if (!navRef.current)
			return;

		let h=navRef.current.clientHeight;
		if (window.getComputedStyle(collapseRef.current).display!="flex")
			h-=Math.round(collapseRef.current.clientHeight);

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
	if (navStyle=="fixed" && renderMode!="ssr")
		navClass+=" fixed-top";

	if (!menuHeader)
		menuHeader=[];

	return (
		<nav class={`navbar navbar-expand-md ${navClass}`} ref={navRef}>
			<div class="container-fluid">
				<A class="navbar-brand" href="/">{sitename}</A>

				<button class="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse"
						data-bs-target="#navbarHead"
						aria-controls="navbarHead" aria-expanded="false" aria-label="Toggle navigation">
					<span class="navbar-toggler-icon"></span>
				</button>

				<div class="collapse navbar-collapse" id="navbarHead" ref={collapseRef}>
					<ul class="navbar-nav me-auto">
						{menuHeader.map(item=>{
							let cls="nav-link";

							if (request.pathname==item.href)
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

				{!webSocketStatus && renderMode!="ssr" && (
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

export function BootswatchCleanPage({request, children, renderMode}) {
	let [navSize,setNavSize]=useState(78);
	let bootswatchNavStyle=useChannel("bootswatchNavStyle");

	let containerStyle={};
	if (bootswatchNavStyle=="fixed" && renderMode!="ssr")
		containerStyle["margin-top"]=navSize+"px";

	let topItems=[];
	katnip.doAction("topItems",topItems,request);

	return (
		<>
			<div class="page d-flex flex-column">
				<Nav request={request} onsize={setNavSize} renderMode={renderMode}/>
				<div style={containerStyle} class="flex-grow-1">
					{topItems}
					{children}
				</div>
				<Footer request={request} />
			</div>
		</>
	);
}

export function BootswatchPageTemplate({request, children, renderMode}) {
	let tc=useTemplateContext();

	let TheContent=katnip.elements.TheContent.component;

	return (
		<BootswatchCleanPage request={request} renderMode={renderMode}>
			<div class="container mb-5">
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
							<TheContent />
						</div>
					</div>
				</div>
			</div>
		</BootswatchCleanPage>
	);
}

export function BootswatchWrapper({request, renderMode, children}) {
	let bootswatchTheme=useChannel("bootswatchTheme");
	let contentHash=useChannel("contentHash");

	let cssUrl="/bootstrap.min.css";
	if (bootswatchTheme)
		cssUrl=`/bootstrap-${bootswatchTheme}.min.css`;

	cssUrl=buildUrl(cssUrl,{contentHash: contentHash});
	let bsUrl=buildUrl("/bootstrap.bundle.min.js",{contentHash: contentHash});

	return (<>
		<Stylesheet href={cssUrl} />
		{renderMode!="ssr" &&
			<script
				src={bsUrl}
				async
			/>
		}
		<style>{`
			html, body, .page, #katnip-root, #katnip-ssr, .resource-blocker {
				height: 100%;
			}
		`}</style>
		{children}
	</>);
}