import {katnip, buildUrl, usePromise, useCounter, BsAlert, bindArgs, PromiseButton} from "katnip";
import {useState} from "preact/compat";
import X_LG from "bootstrap-icons/icons/x-lg.svg";
import CHECK_LG from "bootstrap-icons/icons/check-lg.svg";

const whiteFilter="filter: invert(100%) sepia(19%) saturate(1%) hue-rotate(216deg) brightness(108%) contrast(102%);";
const primaryFilter="filter: invert(30%) sepia(100%) saturate(1483%) hue-rotate(203deg) brightness(96%) contrast(108%);";

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

export function ItemList({columns, items, href, ondelete, refreshOnDelete, actions, deletableCb}) {
	if (refreshOnDelete===undefined)
		refreshOnDelete=true;

	if (!actions)
		actions=[];

	let [counter,invalidate]=useCounter();
	let resolvedItems=usePromise(items,[counter]);
	let [deleteId, setDeleteId]=useState();
	let [deletingId, setDeletingId]=useState();
	let [message, setMessage]=useState();

	async function onRowClick(e) {
		e.stopPropagation();

		let tr=e.target.closest("tr");
		let id=tr.dataset.id;

		if (e.target.closest("button")) {
			let action=e.target.closest("button").dataset.action;
			if (action=="delete") {
				setMessage(null);
				setDeleteId(id);
			}

			else {
				let actionSpec=actions[action];
				await actionSpec.fn(id);
				if (actionSpec.invalidate)
					invalidate();
			}
			return;

		}

		else {
			let newHref=buildUrl(href,{
				id: tr.dataset.id
			});
			katnip.setLocation(newHref);
		}
	}

	function onDialogClose() {
		setDeleteId(null);
	}

	async function onDialogConfirm() {
		let id=deleteId;
		setDeleteId(null);
		setDeletingId(id);

		try {
			let message=await ondelete(id);
			setMessage(message);
		}

		catch (e) {
			setMessage(e);
		}

		if (refreshOnDelete)
			invalidate();

		setDeletingId(null);
	}

	let tableHeaders=[];
	for (let k in columns) {
		let column=columns[k];
		tableHeaders.push(
			<th scope="col" key={k}>
				{column.label}
			</th>
		);
	}
	tableHeaders.push(<th style={{"width":`${3*(actions.length+1)}rem`}}></th>);

	let tableContent;
	if (resolvedItems instanceof Error) {
		tableContent=(
			<div class={`alert alert-dismissible alert-danger`}>
				{resolvedItems.message}
			</div>
		);
	}

	else if (resolvedItems===undefined) {
		tableContent=(<>
			<BsAlert message={message} ondismiss={bindArgs(setMessage,null)}/>
			<div class="spinner-border m-3"/>
		</>);
	}

	else {
		let onTableRowClick;
		let tableRowStyle="";
		if (href) {
			onTableRowClick=onRowClick;
			tableRowStyle="cursor: pointer";
		}

		let tableRows=[];
		for (let item of resolvedItems) {
			let tableItem=[];
			for (let k in columns) {
				let column=columns[k];

				let v=item[k];
				if (column.cb)
					v=column.cb(item);

				tableItem.push(
					<td scope="col" key={k} class="cursor-pointer">
						{v}
					</td>
				);
			}

			let actionButtons=[];
			for (let i=0; i<actions.length; i++) {
				let action=actions[i];
				let active=true;
				if (action.activeCb)
					active=action.activeCb(item);

				let cls="btn-outline-primary";
				if (active)
					cls="btn-primary";

				actionButtons.push(
					<button class={`btn ${cls} btn-sm align-text-bottom text-center`}
							onclick={onRowClick}
							style="margin-right: 0.5rem"
							data-action={i}>
						<img src={CHECK_LG} style="width: 1rem; height: 1rem; vertical-align: -0.18rem" class="btn-image"/>
					</button>
				);
			}

			let cls="btn btn-danger btn-sm align-text-bottom text-center";
			if (deletableCb && !deletableCb(item))
				cls+=" disabled"

			actionButtons.push(
				<button class={cls}
						onclick={onRowClick}
						style="width: 2.1rem"
						data-action="delete">
					{deletingId==item.id &&
						<span class="spinner-border spinner-border-sm" style="width: 0.75rem; height: 0.75rem"/>
					}
					{deletingId!=item.id && 
						<img src={X_LG} style={`${whiteFilter}; width: 1rem; height: 1rem; vertical-align: -0.18rem`}/>
					}
				</button>
			);

			tableItem.push(
				<td class="text-end text-nowrap">
					{actionButtons}
				</td>
			);

			tableRows.push(
				<tr onclick={onTableRowClick} data-id={item.id} style={tableRowStyle}>
					{tableItem}
				</tr>
			);
		}

		let tableClass="table align-middle";
		if (href)
			tableClass+=" table-hover";

		tableContent=(<>
			<BsAlert message={message} ondismiss={bindArgs(setMessage,null)}/>
			<style>{`
				button.btn-outline-primary .btn-image {
					filter: invert(30%) sepia(100%) saturate(1483%) hue-rotate(203deg) brightness(96%) contrast(108%);
				}

				button.btn-primary .btn-image,
				button.btn-outline-primary:hover .btn-image {
					filter: invert(100%) sepia(19%) saturate(1%) hue-rotate(216deg) brightness(108%) contrast(102%);
				}
			`}</style>
			<table class={tableClass} style={{"table-layout":"fixed"}}>
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