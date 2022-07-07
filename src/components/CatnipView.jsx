import {catnip, useChannel, useEventUpdate, useEventListener, TemplateContext, useRevertibleState,
		ResourceBlocker} from "catnip";
import CatnipRequest from "../lib/CatnipRequest.js";
import {useState} from "preact/compat";

export function CatnipView() {
	let redirect=useChannel("redirect");
	let homepath=useChannel("homepath");

	useEventUpdate("locationchange");
	useEventUpdate("popstate");
	useEventListener("message",window,(ev)=>{
		switch (ev.data.type) {
			case "setSession":
				//setSession(ev.data.values);

				for (let k in ev.data.values)
					catnip.setChannelValue(k,ev.data.values[k]);

				break;

			default:
				console.log("got unknown message in iframe...");
				console.log(ev);
		}
	});

	let request=new CatnipRequest();
	request.processBrowserDocument();

	if (redirect && request.pathname!=redirect) {
		catnip.setLocation(redirect);
		return;
	}

	if (homepath && request.pathname==homepath) {
		catnip.setLocation("/");
		request.processBrowserDocument();
	}

	if (request.pathname=="/")
		request.processUrl(homepath);

	let Layout=catnip.getTemplateForRoute(request.pathname);
	let Page=catnip.getPageComponentForRoute(request.pathname);

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
