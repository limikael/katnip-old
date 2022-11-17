import {katnip, A} from "katnip";

export function MediaAdmin({request}) {
	return (<>
		<div class="border-bottom">
			<h1 class="d-inline-block mb-3">Media Library</h1>
			<A class="btn btn-outline-primary align-text-bottom ms-2 btn-sm"
					href="/admin/page?new=1">
				Upload
			</A>
		</div>

		<input type="file"/>
	</>);
}