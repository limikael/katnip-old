import {katnip, lazyComponent, useModal, useApiFetch, bsLoader, A, bindArgs} from "katnip";

function MediaListItem({media, onclick}) {
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

	function onClick(ev) {
		ev.preventDefault();
		onclick(media.id);
	}

	return (
		<div class="col-6 col-sm-4 col-md-3 col-lg-2">
			<div class="shadow rounded border p-3 text-center mb-3" style="position: relative">
				<div class="bg-light" style="width: 100%; aspect-ratio: 1 / 1; position: relative">
					<img style={imgStyle} src={"/"+media.id}/>
				</div>
				<A href="#"
						class="d-block text-truncate mt-3 small stretched-link text-reset text-decoration-none fw-bold"
						onclick={onClick}>
					{media.filename}
				</A>
			</div>
		</div>
	);
}

function SelectMediaModal({resolve}) {
	let medias=useApiFetch("/api/listMedia",{});

	function onMediaClick(id) {
		resolve(id);
	}

	return (
		<div class="modal show fade" style={{display: "block", "background-color": "rgba(0,0,0,0.5)"}} aria-modal="true">
			<div class="modal-dialog modal-lg modal-dialog-centered">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Select Media</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
								onclick={bindArgs(resolve,null)}>
						</button>
					</div>
					<div class="modal-body">
						{bsLoader(medias,()=><>
							<div class="row">
								{medias.map((media)=>
									<MediaListItem 
											media={media} 
											onclick={onMediaClick}/>
								)}
							</div>
						</>)}
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
								onclick={bindArgs(resolve,null)}>
							Cancel
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export function MediaSelect({value, onchange}) {
	let [modal, showModal, resolveModal]=useModal();
	let media=useApiFetch("/api/getMedia",{id: value},[value]);

	async function onSelectMediaClick() {
		let mediaId=await showModal(<SelectMediaModal resolve={resolveModal} />);
		if (mediaId)
			onchange(mediaId);
	}

	return (
		<div class="d-grid">
			{modal}
			{bsLoader(media,()=><>
				<button class="btn btn-outline-primary"
						onclick={onSelectMediaClick}>
					{media?media.filename:"(select)"}
				</button>
			</>)}
		</div>
	);
}
