import {A, katnip, useChannel, useTemplateContext, buildUrl, Stylesheet} from "katnip";
import {BsPage, BsPageContent, BsPageNav, BsPageFooter, 
		BsCenterContent, BsTitle} from "./bootswatch-components.jsx";
import {useRef, useEffect, useState} from "preact/compat";

export function BootswatchCleanPage({request, children, renderMode}) {
	let menuFooter=useChannel("menuFooter");
	if (!menuFooter)
		menuFooter=[];

	return (
		<BsPage>
			<BsPageNav/>
			<BsPageContent>
				{children}
			</BsPageContent>
			<BsPageFooter>
				<div class={`p-3 text-center`}>
					{menuFooter.map(item=>{
						return (
							<A href={item.href} class="text-reset text-decoration-none mx-2">
								{item.label}
							</A>
						);
					})}
				</div>
			</BsPageFooter>
		</BsPage>
	)
}

export function BootswatchPageTemplate({request, children, renderMode}) {
	return (
		<BootswatchCleanPage request={request} renderMode={renderMode}>
			<BsCenterContent>
				<BsTitle/>
				{children}
			</BsCenterContent>
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

	return (<>
		<style>{`
			html, body, .page, #katnip-root, #katnip-ssr, .resource-blocker {
				height: 100%;
			}
		`}</style>
		<Stylesheet href={cssUrl} />
		{children}
	</>);
}