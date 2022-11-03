import {katnip, useChannel, useEventUpdate, useEventListener,
		ResourceBlocker, clearTemplateContext, useValueChanged} from "katnip";
import KatnipClientRequest from "../auth/KatnipClientRequest.js";
import {useState, useRef} from "react";

export function KatnipRequestView({request}) {
	let homepath=useChannel("homepath");

	if (request.pathname=="/")
		request.processUrl(homepath);

	let changed=useValueChanged(request.href);
	if (changed)
		katnip.clearTemplateContext();

	let Page=katnip.getPageComponentForRoute(request.pathname);
	let Layout=katnip.getTemplateForRoute(request.pathname);

	let p=<Page request={request}/>;

	return (
		<ResourceBlocker>
			<Layout request={request}>
				<Page request={request}/>
			</Layout>
		</ResourceBlocker>
	);
}

export function KatnipView() {
	let redirect=useChannel("redirect");
	let homepath=useChannel("homepath");
	let bundleHash=useChannel("bundleHash");
	let bundleHashRef=useRef();
	useEventUpdate(window,"locationchange");
	useEventUpdate(window,"popstate");
	useEventListener(window,"message",(ev)=>{
		switch (ev.data.type) {
			case "setSession":
				for (let k in ev.data.values)
					katnip.setChannelValue(k,ev.data.values[k]);

				break;

			default:
				console.log("got unknown message in iframe...");
				console.log(ev);
		}
	});

	if (bundleHashRef.current &&
			bundleHash!=bundleHashRef.current) {
		bundleHashRef.current=bundleHash;
		console.log("bundle hash changed, refreshing...");
		window.location=window.location;
		return;
	}

	bundleHashRef.current=bundleHash;

	let request=new KatnipClientRequest();

	if (redirect && request.pathname!=redirect) {
		katnip.setLocation(redirect);
		return;
	}

	if (homepath && request.pathname==homepath) {
		katnip.setLocation("/");
		return;
	}

	return <KatnipRequestView request={request}/>
}
