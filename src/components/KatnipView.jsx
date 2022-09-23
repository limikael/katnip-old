import {katnip, useChannel, useEventUpdate, useEventListener, TemplateContext, useRevertibleState,
		ResourceBlocker} from "katnip";
import KatnipRequest from "../lib/KatnipRequest.js";
import {useState} from "preact/compat";

export function KatnipView() {
	let redirect=useChannel("redirect");
	let homepath=useChannel("homepath");

	useEventUpdate("locationchange");
	useEventUpdate("popstate");
	useEventListener("message",window,(ev)=>{
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

	let [title,setTitle]=useRevertibleState(null,[request.href]);

	let tc={title,setTitle};

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
