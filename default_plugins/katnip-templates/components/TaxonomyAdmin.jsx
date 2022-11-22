import {katnip, ItemList, TreeView, PromiseButton, docGetNode, BsInput,
		docWrapFragment, docReplaceNode, docRemoveNode} from "katnip";
import {useState, useRef} from "react";

function TaxonomyEdit({request}) {
	let taxonomies={};
	katnip.doAction("getTaxonomies",taxonomies);
	let taxonomy=taxonomies[request.query.id];

	let [data,setData]=useState([
		{title: "Hello"},
		{title: "World"}
	]);

	function ItemRenderer(props) {
		let itemData=props.data;

		function onClick(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			// fix...
		}

		let linkStyle={
			userSelect: "none",
			WebkitUserDrag: "none"
		};

		let cls="";
		if (itemData.selected)
			cls="bg-primary text-white";

		return (
			<div class={"card shadow-sm "+cls}>
				<div class="card-header" style="border-bottom: none">
					<a href="#"
							onclick={onClick}
							class="text-decoration-none stretched-link text-reset"
							draggable="false"
							style={linkStyle}>
						{itemData.title}
					</a>
				</div>
			</div>
		);
	}

	function onChange(newData) {
		setData(newData);
	}

	function onAddClick() {
		data.push({
			title: "New "+taxonomy.title,
			selected: true
		});
		setData([...data]);
	}

	function onClickOutside() {
	}

	function onNodeChange(ev) {
		/*let node=docGetNode(docWrapFragment(data),selectedPath);
		node.title=ev.target.value;

		let wrapped=docReplaceNode(docWrapFragment(data),selectedPath,node);
		setData([...wrapped.children]);*/
	}

	function onDeleteNodeClick() {
		/*let wrapped=docRemoveNode(docWrapFragment(data),selectedPath);
		setData([...wrapped.children]);
		setSelectedPath();*/
	}

	//let node=docGetNode(docWrapFragment(data),selectedPath);

	return (<>
		<div class="d-flex flex-column" style="height: 100%">
			<div>
				<h1 class="d-inline-block mb-3">{taxonomy.pluralTitle}</h1>
				<button class="btn btn-outline-primary align-text-bottom ms-2 btn-sm"
						onclick={onAddClick}>
					Add {taxonomy.title}
				</button>
				<PromiseButton class="btn btn-primary align-text-bottom ms-2 float-end mt-1">
					Save {taxonomy.pluralTitle}
				</PromiseButton>
			</div>
			<div class="flex-grow-1 d-flex flex-row" style="height: calc(100% - 60px)">
				<div class="flex-grow-1" style="position: relative; height: 100%">
					<div class="border p-2 rounded" style="height: 100%; overflow-y: scroll" onclick={onClickOutside}>
						<TreeView
							data={data}
							itemHeight={42}
							itemSpacing={10}
							itemIndent={30}
							itemRenderer={ItemRenderer}
							itemWidth={300}
							onchange={onChange} />
					</div>
				</div>
				<div style="width: 33%" class="ms-3 ">
					{/*{selectedPath &&
						<div class="bg-light p-3" style="height: 100%">
							<div class="mb-3"><b>{taxonomy.title}</b></div>
							<div class="form-group mb-3">
								<label class="d-block form-label mb-1">Title</label>
								<BsInput 
										value={node.title}
										onchange={onNodeChange}
										data-id="title"/>
							</div>
							<button class="btn btn-danger" onclick={onDeleteNodeClick}>
								Delete {taxonomy.title}
							</button>
						</div>
					}*/}
				</div>
			</div>
		</div>
	</>);
}

function TaxonomyList({request}) {
	let taxonomies={};
	katnip.doAction("getTaxonomies",taxonomies);

	let taxonomiesArray=[];
	for (let k in taxonomies) {
		taxonomies[k].id=k;
		taxonomiesArray.push(taxonomies[k])
	};

	let columns={
		title: {label: "Title"},
		id: {label: "Id"},
	};

	return (<>
		<div>
			<h1 class="d-inline-block mb-3">Taxonomies</h1>
		</div>
		<ItemList
				items={taxonomiesArray}
				columns={columns}
				href="/admin/taxonomy"/>
	</>);
}

export function TaxonomyAdmin({request}) {
	if (request.query.id)
		return <TaxonomyEdit request={request} />

	return <TaxonomyList request={request} />
}
