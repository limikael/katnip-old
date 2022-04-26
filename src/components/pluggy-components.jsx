import {pluggy} from "pluggy";
import {useForceUpdate} from "../utils/react-util.jsx";
import {forwardRef} from "preact/compat";

export function PluggyView() {
	let [session]=pluggy.useSession();
	pluggy.setRefreshFunction(pluggy.useForceUpdate());

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

export function AdminMessages() {
	let m=[...pluggy.getAdminMessages()];

	return (
		<div class="mb-2">
			{m.map(({message, alertClass})=>(
				<div class={`alert alert-dismissible ${alertClass}`}>
					<button type="button" class="btn-close" data-bs-dismiss="alert"
							onclick={pluggy.dismissAdminMessages}></button>
					{message}
				</div>
			))}
		</div>
	);
}
