import {catnip, useSession, useEventUpdate, useEventListener} from "catnip";

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
	if (request.path=="/")
		request=catnip.parseRequest(session.homepath);

	let Layout=catnip.doAction("getPageTemplate",request);
	let Page=catnip.doAction("getPageComponent",request);

	let res=(
		<Layout request={request}>
			<Page request={request}/>
		</Layout>
	);

	return res;
}
