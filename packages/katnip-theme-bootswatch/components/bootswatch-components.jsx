import {katnip, useChannel, A, useElementDimensions, useTemplateContext, setTemplateContext,
		setLocation, getCurrentRequest} from "katnip";
import {useRef} from "react";

export function BsPage({outer, inner, children}) {
	return (
		<div class="page d-flex flex-column" {...outer} {...inner}>
			{children}
		</div>
	);
}

BsPage.wrap=null;
katnip.addElement("BsPage",BsPage);

export function BsPageNav({outer, inner, children, renderMode}) {
	let webSocketStatus=katnip.useWebSocketStatus();
	let navRef=useRef();
	let navDimensions=useElementDimensions(navRef);
	let collapseRef=useRef();
	let collapseDimensions=useElementDimensions(collapseRef);
	let sitename=useChannel("sitename");
	let navColor=useChannel("bootswatchNavColor");
	let navStyle=useChannel("bootswatchNavStyle");
	let menuHeader=useChannel("menuHeader");
	let request=getCurrentRequest();

	let height=navDimensions[1];
	if (collapseRef.current &&
			window.getComputedStyle(collapseRef.current).display!="flex")
		height-=collapseDimensions[1];

	setTemplateContext({navHeight: height});

	if (!navColor)
		navColor="primary";

	let navClass="navbar-dark ";
	if (navColor=="light")
		navClass="navbar-light ";

	navClass+=` bg-${navColor}`;
	if (navStyle=="fixed" && renderMode!="ssr" && renderMode!="editor" &&
			height!=0)
		navClass+=" fixed-top";

	if (!menuHeader)
		menuHeader=[];

	function onNavClick(ev) {
		ev.preventDefault();

		let el=document.querySelector("nav .navbar-collapse");
		if (el)
			el.classList.remove("show");

		setLocation(ev.target.href);
	}

	return (
		<nav class={`navbar navbar-expand-md ${navClass}`} ref={navRef} {...outer}>
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
									<A class={cls} href={item.href} onclick={onNavClick}>
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

BsPageNav.wrap=null;
katnip.addElement("BsPageNav",BsPageNav);

export function BsPageContent({outer, inner, children, renderMode}) {
	let bootswatchNavStyle=useChannel("bootswatchNavStyle");
	let tc=useTemplateContext();

	let containerStyle={};
	if (bootswatchNavStyle=="fixed" && renderMode!="ssr" && renderMode!="editor")
		containerStyle["margin-top"]=tc.navHeight+"px";

	return (
		<div style={containerStyle} class="flex-grow-1" {...outer} {...inner}>
			{children}
		</div>
	)
}

BsPageContent.wrap=null;
katnip.addElement("BsPageContent",BsPageContent);

export function BsPageFooter({outer, inner, children}) {
	let cls, bootswatchFooter=useChannel("bootswatchFooter")
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

	return (
		<footer class={`container-fluid ${cls}`} {...outer} {...inner}>
			{children}
		</footer>
	);
}

BsPageFooter.wrap=null;
katnip.addElement("BsPageFooter",BsPageFooter);

export function BsCenterContent({outer, inner, children}) {
	return (
		<div class="container my-5" {...outer}>
			<div class="row" style="height: 100%">
				<div class="d-none d-lg-block" style="width: 12.5%"></div>
				<div class="col-lg-9" {...inner}>
					{children}
				</div>
			</div>
		</div>
	);
}

BsCenterContent.wrap=null;
katnip.addElement("BsCenterContent",BsCenterContent);

export function BsTitle({outer, inner, renderMode}) {
	let tc=useTemplateContext();
	let title=tc.title;
	if (renderMode=="editor")
		title="<Page Title>";

	let content;
	if (title)
		content=<h1 class="pb-2 border-bottom mb-4">{title}</h1>;

	return <div {...outer}>{content}</div>;
}

BsTitle.wrap=null;
katnip.addElement("BsTitle",BsTitle);
