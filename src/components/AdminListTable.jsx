import {buildUrl, setLocation} from "pluggy";

export default function AdminListTable({columns, items, href}) {
	if (!items)
		return null;

	function onRowClick(e) {
		let tr=e.target.closest("tr");
		let newHref=buildUrl(href,"id",tr.dataset.id);
		setLocation(newHref);
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

		tableRows.push(
			<tr onclick={onRowClick} data-id={item.id} style={{cursor: "pointer"}}>
				{tableItem}
			</tr>
		);
	}

	return (
		<table class="table mt-3 table-hover">
			<thead>
				<tr class="table-light">
					{tableHeaders}
				</tr>
			</thead>
			<tbody>
				{tableRows}
			</tbody>
		</table>
	);
}