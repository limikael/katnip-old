import {pluggy} from "pluggy";
import {useForceUpdate} from "../utils/react-util.jsx";

export function PluggyView() {
	pluggy.setRefreshFunction(useForceUpdate());

	let request=pluggy.getCurrentRequest();
	let Layout=pluggy.doAction("getPageTemplate",request);
	let Page=pluggy.doAction("getPageComponent",request);

	return (
		<Layout request={request}>
			<Page request={request}/>
		</Layout>
	);
}

export function A({children, ...props}) {
	function onClick(ev) {
		ev.preventDefault();
		pluggy.setLocation(props.href);
	}

	return (
		<a {...props} onclick={onClick}>
			{children}
		</a>
	);
}

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
