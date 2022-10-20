import {katnip, useChannel, useEventUpdate, useEventListener, TemplateContext, useRevertibleState,
		ResourceBlocker} from "katnip";
import KatnipRequest from "../lib/KatnipRequest.js";
import {useState, useRef} from "react";

export function KatnipView() {
	let redirect=useChannel("redirect");
	let homepath=useChannel("homepath");
	let bundleHash=useChannel("bundleHash");
	let bundleHashRef=useRef();

	if (bundleHashRef.current &&
			bundleHash!=bundleHashRef.current) {
		bundleHashRef.current=bundleHash;
		console.log("bundle hash changed, refreshing...");
		window.location=window.location;
		return;
	}

	bundleHashRef.current=bundleHash;

	useEventUpdate(window,"locationchange");
	useEventUpdate(window,"popstate");
	useEventListener(window,"message",(ev)=>{
		switch (ev.data.type) {
			case "setSession":
				//setSession(ev.data.values);

				for (let k in ev.data.values)
					katnip.setChannelValue(k,ev.data.values[k]);

				break;

			default:
				console.log("got unknown message in iframe...");
				console.log(ev);
		}
	});

	let request=new KatnipRequest();
	request.processBrowserDocument();

	if (redirect && request.pathname!=redirect) {
		katnip.setLocation(redirect);
		return;
	}

	if (homepath && request.pathname==homepath) {
		katnip.setLocation("/");
		request.processBrowserDocument();
	}

	if (request.pathname=="/")
		request.processUrl(homepath);

	let Layout=katnip.getTemplateForRoute(request.pathname);
	let Page=katnip.getPageComponentForRoute(request.pathname);

	let [tcVals,setTcVals]=useRevertibleState(null,[request.href]);
	if (!tcVals)
		tcVals={};

	function tcSet(o) {
		let changed=false;

		for (let k in o)
			if (tcVals[k]!=o[k]) {
				tcVals[k]=o[k];
				changed=true;
			}

		if (changed)
			setTcVals(tcVals);
	}

	let tc={...tcVals, set: tcSet};

	let res=(<>
		<ResourceBlocker>
			<TemplateContext.Provider value={tc}>
				<Layout request={request}>
					<Page request={request}/>
				</Layout>
			</TemplateContext.Provider>
		</ResourceBlocker>
	</>);

	return res;
}
