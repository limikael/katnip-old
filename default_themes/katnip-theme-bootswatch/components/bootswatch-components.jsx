import {katnip, useChannel, A, useElementDimensions, useTemplateContext, setTemplateContext,
		setLocation, getCurrentRequest} from "katnip";
import {useRef} from "react";

function BsPage({outer, inner, children}) {
	return (
		<div class="page d-flex flex-column" {...outer} {...inner}>
			{children}
		</div>
	);
}

BsPage.wrap=null;
katnip.addElement("BsPage",BsPage);

function BsPageNav({outer, inner, children, renderMode}) {
	let webSocketStatus=katnip.useWebSocketStatus();
	let navRef=useRef();
	let navDimensions=useElementDimensions(navRef);
	let collapseRef=useRef();
	let collapseDimensions=useElementDimensions(collapseRef);
	let sitename=useChannel("sitename");
	let navColor=useChannel("bootswatchNavColor");
	let navStyle=useChannel("bootswatchNavStyle");
	let menuHeader=useChannel("menuHeader");
	let tc=useTemplateContext();
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
	if (navStyle=="fixed" && renderMode!="ssr" && renderMode!="editor")
		navClass+=" fixed-top";

	if (!menuHeader)
		menuHeader=[];

	function onNavClick(ev) {
		ev.preventDefault();

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

function BsPageContent({outer, inner, children, renderMode}) {
	let bootswatchNavStyle=useChannel("bootswatchNavStyle");
	let tc=useTemplateContext();

	let containerStyle={};
	if (bootswatchNavStyle=="fixed" && renderMode!="ssr")
		containerStyle["margin-top"]=tc.navHeight+"px";

	return (
		<div style={containerStyle} class="flex-grow-1" {...outer} {...inner}>
			{children}
		</div>
	)
}

BsPageContent.wrap=null;
katnip.addElement("BsPageContent",BsPageContent);

function BsPageFooter({outer, inner, children}) {
	return (
		<footer class="container-fluid bg-black" {...outer} {...inner}>
			{children}
		</footer>
	);
}

BsPageFooter.wrap=null;
katnip.addElement("BsPageFooter",BsPageFooter);

