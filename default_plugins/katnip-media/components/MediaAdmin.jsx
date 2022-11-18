import {katnip, PromiseButton, delay, waitEvent, apiFetch, useApiFetch, bsLoader, A, buildUrl,
		BsInput, useForm, useModal,bindArgs,useCounter} from "katnip";
import {useRef} from "react";

function Modal({resolve, message}) {
	return (
		<div class="modal show fade" style={{display: "block", "background-color": "rgba(0,0,0,0.5)"}} aria-modal="true">
			<div class="modal-dialog modal-dialog-centered">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Confirm</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
								onclick={resolve}>
						</button>
					</div>
					<div class="modal-body">
						<p>{message}</p>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
								onclick={bindArgs(resolve,false)}>
							Cancel
						</button>
						<button type="button" class="btn btn-danger"
								onclick={bindArgs(resolve,true)}>
							Delete
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

function MediaListItem({media}) {
	let imgStyle={
		maxWidth: "100%",
		maxHeight: "100%",
		width: "auto",
		height: "auto",
		position: "absolute",
		top: "50%",
 		left: "50%",
		transform: "translate(-50%, -50%)",
	};

	let editUrl=buildUrl("/admin/media",{id: media.id});

	return (
		<div class="col-6 col-sm-4 col-md-3 col-lg-2">
			<div class="shadow rounded border p-3 text-center mb-3" style="position: relative">
				<div class="bg-light" style="width: 100%; aspect-ratio: 1 / 1; position: relative">
					<img style={imgStyle} src={media.url}/>
				</div>
				<A href={editUrl}
						class="d-block text-truncate mt-3 small stretched-link text-reset text-decoration-none fw-bold">
					{media.filename}
				</A>
			</div>
		</div>
	);
}

function MediaList({request}) {
	let [counter,invalidate]=useCounter();
	let medias=useApiFetch("/api/listMedia",{},[counter]);

	async function onFileSelect(files) {
		console.log(files[0]);

		await apiFetch("/api/uploadMedia",{file: files[0]});
		invalidate();
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
				{medias.map((media)=><MediaListItem media={media}/>)}
			</div>
		</>)}
	</>);
}

function MediaEdit({request}) {
	let [modal, showModal, resolveModal]=useModal();
	let media=useApiFetch("/api/getMedia",{id: request.query.id},[request.query.id]);
	let imgStyle={
		maxWidth: "100%",
		maxHeight: "100%",
		width: "auto",
		height: "auto",
		position: "absolute",
		top: "50%",
 		left: "50%",
		transform: "translate(-50%, -50%)",
	};

	async function onDeleteClick() {
		let res=await showModal(<Modal resolve={resolveModal} message="Sure you want to delete this media item?"/>);

		if (res) {
			await apiFetch("/api/deleteMedia",{id: request.query.id});
			katnip.setLocation("/admin/media");
		}
	}

	return (<>
		{modal}
		<div class="d-flex flex-column" style="height: 100%">
			<div class="border-bottom mb-3">
				<h1 class="d-inline-block mb-3">Edit Media</h1>
			</div>
			{bsLoader(media,()=><>
				<div class="flex-grow-1 d-flex flex-row">
					<div class="flex-grow-1" style="position: relative">
						<img style={imgStyle} src={media.url}/>
					</div>
					<div style="width: 25%" class="bg-light ms-3 p-3">
						<div class="mb-3"><b>Media</b></div>
						<div class="fw-bold">Filename</div>
						<div class="mb-3">{media.filename}</div>

						<PromiseButton class="btn btn-danger" onclick={onDeleteClick}>Delete</PromiseButton>
					</div>
				</div>
			</>)}
		</div>
	</>);
}

export function MediaAdmin({request}) {
	if (request.query.id || request.query.new)
		return <MediaEdit request={request}/>

	return <MediaList request={request}/>
}
