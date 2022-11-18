import {katnip, PromiseButton, delay, waitEvent, apiFetch, useApiFetch, bsLoader} from "katnip";
import {useRef} from "react";

function MediaItem({media}) {
	return (
		<div class="shadow rounded border p-3 m-3 col-3 text-center">
			<div style="width: 100%; aspect-ratio: 1 / 1; background-color: #f00;">
				<img />
			</div>
			<div class="mt-2">
				<small><b>{media.filename}</b></small>
			</div>
		</div>
	);
}

export function MediaAdmin({request}) {
	let medias=useApiFetch("/api/listMedia");

	async function onFileSelect(files) {
		console.log(files[0]);

		await apiFetch("/api/uploadMedia",{file: files[0]});
	}

	return (<>
		<div class="border-bottom mb-3">
			<h1 class="d-inline-block mb-3">Media Library</h1>
			<PromiseButton class="btn btn-outline-primary align-text-bottom ms-2 btn-sm"
					onfileselect={onFileSelect}>
				Upload
			</PromiseButton>
		</div>
		{bsLoader(medias,()=><>
			<div class="row">
				{medias.map((media)=><MediaItem media={media}/>)}
			</div>
		</>)}
	</>);
}