import {useState, useEffect, useRef} from "react";
import LIST_NESTED from "bootstrap-icons/icons/list-nested.svg";
import PLUS_LG from "bootstrap-icons/icons/plus-lg.svg";
import PUZZLE_FILL from "bootstrap-icons/icons/puzzle-fill.svg";
import FILE_EARMARK_TEXT_FILL from "bootstrap-icons/icons/file-earmark-text-fill.svg";
import {katnip, bindArgs, BsInput, useForm, PromiseButton, useTemplateContext,
		Editor, useEditor, TreeView} from "katnip";

const whiteFilter="filter: invert(100%) sepia(19%) saturate(1%) hue-rotate(216deg) brightness(108%) contrast(102%);";
let elementEditors;

/*function EditorStructure({editor, path}) {
	if (!path)
		path=[];

	function onClick(ev) {
		ev.preventDefault();
		editor.selectPath(path);
		editor.focus();
	}

	node=editor.getDocNode(path);
	let name=node.type;
	if (typeof node=="string")
		name="text";

	let cls="";
	if (JSON.stringify(editor.path)==JSON.stringify(path))
		cls="fw-bold text-body text-decoration-none";

	return (<>
		<li><a href="#" onclick={onClick} class={cls}>{name}</a></li>
		<ul>
			{editor.getDocChildPaths(path).map((childPath)=>
				<EditorStructure editor={editor} path={childPath} />
			)}
		</ul>
	</>);
}*/

function EditorStructure({editor}) {
	let data=editor.getDocNode([]).children;

	function ItemRenderer({data, path}) {
		let label;
		if (typeof data=="string")
			label="#text"

		else
			label=data.type;

		let cls="border border-primary bg-white shadow-sm text-primary px-2 position-relative ";

		if (JSON.stringify(editor.path)==JSON.stringify(path))
			cls+="fw-bold"

		function onClick(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			editor.selectPath(path);
		}

		let linkStyle={
			userSelect: "none",
			WebkitUserDrag: "none"
		};

		return (
			<div class={cls}>
				<a href="#"
						onclick={onClick}
						class="text-decoration-none stretched-link"
						draggable="false"
						style={linkStyle}>
					{label}
				</a>
			</div>
		);
	}

	function onChange(newData) {
		let root=editor.getDocNode();
		root.children=newData;
		editor.setDoc(root);
		editor.selectPath(null);
	}

	return (<>
		<TreeView
			data={data}
			itemHeight={25}
			itemSpacing={5}
			itemIndent={30}
			itemRenderer={ItemRenderer}
			itemWidth={100}
			onchange={onChange} />
	</>)
}

function ComponentLibrary({editor}) {
	function onAddClick(componentName) {
		editor.addDocNodeAtCursor({
			"type": componentName,
			"props": {},
			"children": []
		});

		editor.focus();
	}

	return (<>
		<div class="mb-3"><b>Components</b></div>
		{Object.keys(katnip.elements).map((componentName)=>
			<button class="btn btn-primary me-2 mb-2"
					onclick={bindArgs(onAddClick,componentName)}>
				{componentName}
			</button>
		)}
	</>);
}

function EditorPath({editor}) {
	function pathClick(path, ev) {
		ev.preventDefault();
		editor.selectPath(path);
	}

	let path=editor.path;
	if (!path)
		path=[];

	let els=[];
	for (let i=0; i<path.length+1; i++) {
		let nodePath=path.slice(0,i);
		let node=editor.getDocNode(nodePath);
		let type="text";
		if (typeof node!="string")
			type=node.type;

		if (i)
			els.push(<span class="mx-1">&raquo;</span>);

		els.push(<a href="#" onclick={bindArgs(pathClick,nodePath)}>{type}</a>)
	}

	return els;
}

function ComponentProperties({editor}) {
	let node=editor.getDocNode(editor.path);

	if (!node || !katnip.elements[node.type])
		return;

	let controls={};
	if (katnip.elements[node.type].options?.controls)
		controls=katnip.elements[node.type].options.controls;

	function onPropChange(ev) {
		let props=editor.getDocNode(editor.path).props;
		props[ev.target.dataset.id]=ev.target.value;

		editor.setDocNodeProps(editor.path,props);
	}

	return <>
		<div class="mb-3"><b>{node.type}</b></div>
		{Object.entries(controls).map(([id,control])=>
			<div class="form-group mb-3">
				<label class="form-label mb-1">{control.title}</label>
				<BsInput {...control} 
						value={node.props[id]?node.props[id]:""}
						onchange={onPropChange}
						data-id={id}/>
			</div>
		)}
	</>;
}

export default function ContentEditor({request, metaEditor, read, write, deps, saveLabel}) {
	let tc=useTemplateContext();
	tc.set({tight: true});

	let [leftMode,setLeftMode]=useState();
	let [rightMode,setRightMode]=useState("document");

	let editor=useEditor({
		elements: katnip.elements,
		doc: {
			type: "Div",
			children: [
				{type: "Heading", props: {}, children: ["This is the article"]},
				{type: "Paragraph", props: {}, children: [
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. "+
					"Proin cursus elementum neque, quis auctor nisl rhoncus quis. "+
					"Proin id pulvinar ligula. Nam eleifend lobortis neque sed fermentum. "+
					"Sed egestas hendrerit nisi, quis sollicitudin magna. Maecenas in magna nisl. "+
					"Quisque dictum accumsan ex. Etiam a euismod massa, eget sodales quam. "+
					"Aliquam vehicula metus viverra nisi imperdiet, id interdum mauris laoreet. "+
					"Curabitur facilisis gravida lacus vitae elementum. xx",
				]},
			],
			props: {}
		}
	});

	let documentForm=useForm({
		initial: async ()=>{
			let data=await read();

			return data;
		},
		deps: deps
	});

	function toggleLeftMode(mode) {
		if (leftMode==mode)
			setLeftMode(null);

		else
			setLeftMode(mode);
	}

	function toggleRightMode(mode) {
		if (rightMode==mode)
			setRightMode(null);

		else
			setRightMode(mode);
	}

	async function writeClick() {
		let saveData=documentForm.getCurrent();
		saveData.content=editor.getHTML();

		let saved=await write(saveData);
		documentForm.setCurrent(saved);
	}

	if (!documentForm.getCurrent())
		return;

	let MetaEditor=metaEditor;

	function debug() {
		console.log("debug");
	}

	return (
		<div style="width: 100%; height: calc( 100% - 40px )" class="d-flex flex-column">
			<div class="bg-light p-3 border-bottom d-flex flex-row">
				<button class={`btn btn-primary me-2 ${leftMode=="tree"?"active":""} align-text-bottom`}
						style="height: 2.4em"
						onclick={bindArgs(toggleLeftMode,"tree")}>
					<img src={LIST_NESTED} style={`${whiteFilter}`}/>
				</button>
				<button class={`btn btn-primary me-2 ${leftMode=="components"?"active":""} align-text-bottom`}
						style="height: 2.4em"
						onclick={bindArgs(toggleLeftMode,"components")}>
					<img src={PLUS_LG} style={`${whiteFilter}`}/>
				</button>
				<h2 class="d-inline-block mb-0 me-auto">{documentForm.getCurrent().title}</h2>
				<button class={`btn btn-primary ms-2`}
						onclick={debug}>
					DEBUG
				</button>
				<button class={`btn btn-primary ms-2 ${rightMode=="component"?"active":""} align-text-bottom`}
						style="height: 2.4em"
						onclick={bindArgs(toggleRightMode,"component")}>
					<img src={PUZZLE_FILL} style={`${whiteFilter}`}/>
				</button>
				<button class={`btn btn-primary ms-2 ${rightMode=="document"?"active":""} align-text-bottom`}
						style="height: 2.4em"
						onclick={bindArgs(toggleRightMode,"document")}>
					<img src={FILE_EARMARK_TEXT_FILL} style={`${whiteFilter}`}/>
				</button>
				<PromiseButton class={`btn btn-primary ms-2`} onclick={writeClick}>
					{saveLabel}
				</PromiseButton>
			</div>
			<div class="flex-grow-1 d-flex flex-row" style="overflow: hidden;">
				{leftMode=="tree" &&
					<div class="bg-light border-end p-3 flex-shrink-0" style="width: 25%">
						<div class="mb-3"><b>Document</b></div>
						<EditorStructure editor={editor} />
					</div>
				}
				{leftMode=="components" &&
					<div class="bg-light border-end p-3 flex-shrink-0" style="width: 25%">
						<ComponentLibrary editor={editor}/>
					</div>
				}
				<div class="flex-grow-1" style="overflow: scroll;">
					<Editor class="m-3" editor={editor}/>
				</div>
				{rightMode=="component" &&
					<div class="bg-light border-start p-3 flex-shrink-0" style="width: 25%">
						<ComponentProperties editor={editor}/>
					</div>
				}
				{rightMode=="document" &&
					<div class="bg-light border-start p-3 flex-shrink-0" style="width: 25%">
						<MetaEditor form={documentForm}/>
					</div>
				}
			</div>
			<div class="bg-light border-top px-3 py-1 small">
				<EditorPath editor={editor}/>
			</div>
		</div>
	);
}
