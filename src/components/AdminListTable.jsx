import {buildUrl, setLocation} from "pluggy";
import {useState} from "preact/compat";

function DeleteConfirmation({onclose, onconfirm}) {
	return (
		<div class="modal show fade" style={{display: "block", "background-color": "rgba(0,0,0,0.5)"}} aria-modal="true">
			<div class="modal-dialog modal-dialog-centered">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Confirm</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
								onclick={onclose}>
						</button>
					</div>
					<div class="modal-body">
						<p>Sure you want to delete this item?</p>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
								onclick={onclose}>
							Cancel
						</button>
						<button type="button" class="btn btn-danger"
								onclick={onconfirm}>
							Delete
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function AdminListTable({columns, items, href, ondelete}) {
	let [deleteId, setDeleteId]=useState();

	if (!items)
		return null;

	function onRowClick(e) {
		let tr=e.target.closest("tr");
		let id=tr.dataset.id;

		if (e.target.tagName=="BUTTON")
			setDeleteId(id);

		else {
			let newHref=buildUrl(href,{
				id: tr.dataset.id
			});
			setLocation(newHref);
		}
	}

	function onDialogClose() {
		setDeleteId(null);
	}

	function onDialogConfirm() {
		let id=deleteId;
		setDeleteId(null);

		ondelete(id);
	}

	let tableHeaders=[];
	for (let k in columns) {
		column=columns[k];
		tableHeaders.push(
			<th scope="col" key={k}>
				{column.label}
			</th>
		);
	}
	tableHeaders.push(<th style={{"width":"3rem"}}></th>);

	let tableRows=[];
	for (let item of items) {
		let tableItem=[];
		for (let k in columns) {
			column=columns[k];
			tableItem.push(
				<td scope="col" key={k} class="cursor-pointer">
					{item[k]}
				</td>
			);
		}
		tableItem.push(<td class="text-end"><button class="btn btn-danger btn-sm">X</button></td>);

		tableRows.push(
			<tr onclick={onRowClick} data-id={item.id} style={{cursor: "pointer"}}>
				{tableItem}
			</tr>
		);
	}

	let dialog;
	if (deleteId)
		dialog=<DeleteConfirmation onclose={onDialogClose} onconfirm={onDialogConfirm} />


	return (<>
		{dialog}
		<table class="table table-hover align-middle" style={{"table-layout":"fixed"}}>
			<thead>
				<tr class="table-light">
					{tableHeaders}
				</tr>
			</thead>
			<tbody>
				{tableRows}
			</tbody>
		</table>
	</>);
}