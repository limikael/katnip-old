import pluggy, {PluggyContext} from "pluggy";
import {useForceUpdate} from "../utils/react-util.jsx";

export default function PluggyView() {
	window.forcePluggyUpdate=useForceUpdate();

	let request=pluggy.getCurrentRequest();
	let Layout=pluggy.applyFilters("getPageTemplate",null,request);
	let Page=pluggy.applyFilters("getPageComponent",null,request);

	return (
		<Layout request={request}>
			<Page request={request}/>
		</Layout>
	);
}