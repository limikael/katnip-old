import {pluggy} from "pluggy";
import {useForceUpdate} from "../utils/react-util.jsx";
import {forwardRef} from "preact/compat";

export function PluggyView() {
	pluggy.setRefreshFunction(pluggy.useForceUpdate());

	let request=pluggy.getCurrentRequest();
	request.wrappers=[];

	let Layout=pluggy.doAction("getPageTemplate",request);
	let Page=pluggy.doAction("getPageComponent",request);

	let res=(
		<Layout request={request}>
			<Page request={request}/>
		</Layout>
	);

	for (let Wrapper of request.wrappers) {
		res=<Wrapper request={request}>{res}</Wrapper>
	}

	return res;
}

export const A=forwardRef(({children, ...props}, ref)=>{
	function onClick(ev) {
		ev.preventDefault();
		let request=pluggy.getCurrentRequest();

		let href=props.href;
		if (request.query._customizer && href!="/admin")
			href=pluggy.buildUrl(href,{_customizer: true});

		pluggy.setLocation(href);
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
