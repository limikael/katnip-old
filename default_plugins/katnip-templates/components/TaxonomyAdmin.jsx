import {katnip, ItemList, TreeView, PromiseButton, docGetNode, BsInput,
		docWrapFragment, docReplaceNode, docRemoveNode, docMap, docFindPath,
		apiFetch, useApiFetch, useRevertibleState, bsLoader, usePromise} from "katnip";
import {useState, useRef} from "react";

function TaxonomyEdit({request}) {
	let taxonomies={};
	katnip.doAction("getTaxonomies",taxonomies);
	let taxonomy=taxonomies[request.query.id];

	let serverData=useApiFetch("/api/getTermsTree",{taxonomy: request.query.id},[request.query.id]);
	let [data,setData]=useRevertibleState(serverData,[serverData]);

	let dataRef=useRef();
	dataRef.current=data;

	function ItemRenderer({data, path}) {
		function onClick(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			let wrapped=docMap(docWrapFragment(dataRef.current),(item, p)=>{
				item.selected=(JSON.stringify(p)==JSON.stringify(path));
			});

			setData([...wrapped.children]);
		}

		let linkStyle={
			userSelect: "none",
			WebkitUserDrag: "none"
		};

		let cls="";
		if (data.selected)
			cls="bg-primary text-white";

		return (
			<div class={"card shadow-sm "+cls}>
				<div class="card-header" style="border-bottom: none">
					<a href="#"
							onclick={onClick}
							class="text-decoration-none stretched-link text-reset"
							draggable="false"
							style={linkStyle}>
						{data.title}
					</a>
				</div>
			</div>
		);
	}

	function onChange(newData) {
		setData(newData);
	}

	function unselect() {
		let wrapped=docMap(docWrapFragment(data),(item)=>{
			item.selected=false
		});
		setData([...wrapped.children]);
	}

	function onAddClick() {
		unselect();
		data.push({
			title: "New "+taxonomy.title,
			selected: true
		});
		setData([...data]);
	}

	function onClickOutside() {
		unselect();
	}

	function onNodeChange(ev) {
		let selectedPath=docFindPath(docWrapFragment(data),node=>node.selected)
		let node=docGetNode(docWrapFragment(data),selectedPath);
		node.title=ev.target.value;
		let wrapped=docReplaceNode(docWrapFragment(data),selectedPath,node);
		setData([...wrapped.children]);
	}

	function onDeleteNodeClick() {
		let selectedPath=docFindPath(docWrapFragment(data),node=>node.selected)
		let wrapped=docRemoveNode(docWrapFragment(data),selectedPath);
		setData([...wrapped.children]);
	}

	async function onSaveClick() {
		let newData=await apiFetch("/api/saveTermsTree",{
			taxonomy: request.query.id,
			terms: data
		});

		setData(newData);
	}

	let selectedPath=docFindPath(docWrapFragment(data),node=>node.selected)
	let selectedNode=docGetNode(docWrapFragment(data),selectedPath);

	return (<>
		<div class="d-flex flex-column" style="height: 100%">
			<div>
				<h1 class="d-inline-block mb-3">{taxonomy.pluralTitle}</h1>
				<button class="btn btn-outline-primary align-text-bottom ms-2 btn-sm"
						onclick={onAddClick}>
					Add {taxonomy.title}
				</button>
				<PromiseButton class="btn btn-primary align-text-bottom ms-2 float-end mt-1"
						onclick={onSaveClick}>
					Save {taxonomy.pluralTitle}
				</PromiseButton>
			</div>
			{bsLoader(data,()=><>
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
						{selectedPath && selectedNode &&
							<div class="bg-light p-3" style="height: 100%">
								<div class="mb-3"><b>{taxonomy.title}</b></div>
								<div class="form-group mb-3">
									<label class="d-block form-label mb-1">Title</label>
									<BsInput 
											value={selectedNode.title}
											onchange={onNodeChange}
											data-id="title"/>
								</div>
								<button class="btn btn-danger" onclick={onDeleteNodeClick}>
									Delete {taxonomy.title}
								</button>
							</div>
						}
					</div>
				</div>
			</>)}
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
