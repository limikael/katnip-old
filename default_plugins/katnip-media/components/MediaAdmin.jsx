import {katnip, PromiseButton, delay, waitEvent, apiFetch} from "katnip";
import {useRef} from "react";

export function MediaAdmin({request}) {
	let fileInputRef=useRef();

	async function onFileSelect(files) {
		console.log(files[0]);

		await apiFetch("/api/uploadMedia",{file: files[0]});
	}

	return (<>
		<div class="border-bottom">
			<h1 class="d-inline-block mb-3">Media Library</h1>
			<PromiseButton class="btn btn-outline-primary align-text-bottom ms-2 btn-sm"
					onfileselect={onFileSelect}>
				Upload
			</PromiseButton>
		</div>
	</>);
}