import {pluggy} from "pluggy";
import {useEventUpdate, useEventListener} from "../utils/react-util.jsx";
import {forwardRef} from "preact/compat";

export function PluggyView() {
	let [session,setSession]=pluggy.useSession();
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

	let request=pluggy.getCurrentRequest();
	if (request.path=="/")
		request=pluggy.parseRequest(session.homepath);

	let Layout=pluggy.doAction("getPageTemplate",request);
	let Page=pluggy.doAction("getPageComponent",request);

	let res=(
		<Layout request={request}>
			<Page request={request}/>
		</Layout>
	);

	return res;
}

export const A=forwardRef(({children, ...props}, ref)=>{
	function onClick(ev) {
		ev.preventDefault();
		pluggy.setLocation(props.href);
	}

	return (
		<a {...props} onclick={onClick} ref={ref}>
			{children}
		</a>
	);
});
