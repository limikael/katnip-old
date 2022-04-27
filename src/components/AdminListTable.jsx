import {pluggy, buildUrl, usePromise, useCounter, BootstrapAlert, bindArgs} from "pluggy";
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

export function AdminListTable({columns, items, href, ondelete}) {
	let [counter,invalidate]=useCounter();
	let resolvedItems=usePromise(items,[counter]);
	let [deleteId, setDeleteId]=useState();
	let [message, setMessage]=useState();

	function onRowClick(e) {
		let tr=e.target.closest("tr");
		let id=tr.dataset.id;

		if (e.target.tagName=="BUTTON") {
			setMessage(null);
			setDeleteId(id);
		}

		else {
			let newHref=buildUrl(href,{
				id: tr.dataset.id
			});
			pluggy.setLocation(newHref);
		}
	}

	function onDialogClose() {
		setDeleteId(null);
	}

	async function onDialogConfirm() {
		let id=deleteId;
		setDeleteId(null);

		try {
			let message=await ondelete(id);
			setMessage(message);
		}

		catch (e) {
			setMessage(e);
		}

		invalidate();
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

	let tableContent;
	if (resolvedItems instanceof Error) {
		tableContent=(
			<div class={`alert alert-dismissible alert-danger`}>
				{/*<button type="button" class="btn-close" data-bs-dismiss="alert"
						onclick={dismissMessage}></button>*/}
				{resolvedItems.message}
			</div>
		);
	}

	else if (resolvedItems===undefined) {
		tableContent=(<>
			<BootstrapAlert message={message} ondismiss={bindArgs(setMessage,null)}/>
			<div class="spinner-border m-3"/>
		</>);
	}

	else {
		let tableRows=[];
		for (let item of resolvedItems) {
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

		tableContent=(<>
			<BootstrapAlert message={message} ondismiss={bindArgs(setMessage,null)}/>
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

	let dialog;
	if (deleteId)
		dialog=<DeleteConfirmation onclose={onDialogClose} onconfirm={onDialogConfirm} />

	return (<>
		{dialog}
		{tableContent}
	</>);
}