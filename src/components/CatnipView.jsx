import {catnip, useChannel, useEventUpdate, useEventListener, TemplateContext, useRevertibleState} from "catnip";
import {useState} from "preact/compat";

export function CatnipView() {
//	let [session,setSession]=useSession();
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

	let request=catnip.getCurrentRequest();
	if (redirect && request.path!=redirect) {
		catnip.setLocation(redirect);
		return;
	}

	if (homepath && request.path==homepath) {
		catnip.setLocation("/");
		request=catnip.getCurrentRequest();
	}

	if (request.path=="/")
		request=catnip.parseRequest(homepath);

	let Layout=catnip.getTemplateForRoute(request.path);
	let Page=catnip.getPageComponentForRoute(request.path);

	let [title,setTitle]=useRevertibleState(null,[request.href]);
	let tc={title,setTitle};

	let res=(<>
		<TemplateContext.Provider value={tc}>
			<Layout request={request}>
				<Page request={request}/>
			</Layout>
		</TemplateContext.Provider>
	</>);

	return res;
}
