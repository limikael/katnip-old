import {catnip, useSession, useEventUpdate, useEventListener, TemplateContext, useRevertibleState} from "catnip";
import {useState} from "preact/compat";

export function CatnipView() {
	let [session,setSession]=useSession();
	useEventUpdate("locationchange");
	useEventUpdate("popstate");
	useEventListener("message",window,(ev)=>{
		switch (ev.data.type) {
			case "setSession":
				setSession(ev.data.values);
				break;

			default:
				console.log("got unknown message in iframe...");
				console.log(ev);
		}
	});

	let request=catnip.getCurrentRequest();
	if (session.redirect && request.path!=session.redirect) {
		catnip.setLocation(session.redirect);
		return;
	}

	if (session.homepath && request.path==session.homepath) {
		catnip.setLocation("/");
		request=catnip.getCurrentRequest();
	}

	if (request.path=="/")
		request=catnip.parseRequest(session.homepath);

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
