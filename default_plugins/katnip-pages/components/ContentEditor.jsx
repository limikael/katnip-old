import {useState, useEffect, useRef} from "react";
import LIST_NESTED from "bootstrap-icons/icons/list-nested.svg";
import PLUS_LG from "bootstrap-icons/icons/plus-lg.svg";
import PUZZLE_FILL from "bootstrap-icons/icons/puzzle-fill.svg";
import CODE_SLASH from "bootstrap-icons/icons/code-slash.svg";
import FILE_EARMARK_TEXT_FILL from "bootstrap-icons/icons/file-earmark-text-fill.svg";
import {katnip, bindArgs, BsInput, useForm, PromiseButton, useTemplateContext,
		Editor, useEditor, TreeView, useEventListener, useInstance, withTargetValue,
		useEventUpdate} from "katnip";
import ContentEditorState from "./ContentEditorState.js";

const whiteFilter="filter: invert(100%) sepia(19%) saturate(1%) hue-rotate(216deg) brightness(108%) contrast(102%);";
const primaryFilter="filter: invert(30%) sepia(100%) saturate(1483%) hue-rotate(203deg) brightness(96%) contrast(108%);";

function EditorStructure({editor}) {
	let data=editor.getDoc();
	let ref=useRef();

	function ItemRenderer({data, path}) {
		let label;
		if (typeof data=="string")
			label="\u00ABtext\u00BB"

		else
			label=data.type;

		let cls="border border-primary bg-white shadow text-primary px-2 position-relative ";

		if (JSON.stringify(editor.startPath)==JSON.stringify(path))
			cls+="fw-bold"

		function onClick(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			editor.select(path);
			editor.focus();
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
		editor.setDoc(newData);
		editor.select();
	}

	function onClickOutside() {
		editor.select();
		editor.focus();
	}

	return (<>
		<div class="mb-3"><b>Document</b></div>
		<div tabindex={0} ref={ref} onclick={onClickOutside} style={{height: "100%"}}>
			<TreeView
				data={data}
				itemHeight={25}
				itemSpacing={5}
				itemIndent={30}
				itemRenderer={ItemRenderer}
				itemWidth={100}
				onchange={onChange} />
		</div>
	</>)
}

function ComponentLibrary({editor, toggleLeftMode}) {
	function onAddClick(componentName) {
		let c=[];
		if (katnip.elements[componentName].default)
			c=JSON.parse(JSON.stringify(katnip.elements[componentName].default));

		editor.addDocNodeAtCursor({
			"type": componentName,
			"props": {},
			"children": c
		});

		toggleLeftMode("tree");
		editor.focus();
	}

	//let disabled=true;
	//let parent=editor.getDocNode(editor.startPath);
	//	disabled=false;

	return (<>
		<div class="mb-3"><b>Components</b></div>
		{Object.keys(katnip.elements).map((componentName)=>
			(!katnip.elements[componentName].internal &&
				<button class="btn btn-primary me-2 mb-2"
						onclick={bindArgs(onAddClick,componentName)}>
					{componentName}
				</button>
			)
		)}
	</>);
}

function EditorPath({editor}) {
	function pathClick(path, ev) {
		ev.preventDefault();
		editor.select(path);
	}

	let path=editor.startPath;
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
	let node=editor.getDocNode(editor.startPath);

	if (!node || !katnip.elements[node.type])
		return;

	function onPropChange(ev) {
		let props=editor.getDocNode(editor.startPath).props;
		props[ev.target.dataset.id]=ev.target.value;

		editor.setDocNodeProps(editor.startPath,props);
	}

	let controls=katnip.elements[node.type].controls;

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

function CodeEditor({contentEditor}) {
	return (
		<div style="width: 100%; height: 100%" class="p-3">
			<textarea style="width: 100%; height: 100%; resize: none; border: none"
					class="bg-dark text-white form-control font-monospace lh-sm"
					onchange={withTargetValue(contentEditor.setXml)}>
				{contentEditor.xml}
			</textarea>
		</div>
	)
}

function CodeEditorStatus({contentEditor}) {
	if (contentEditor.error)
		return <span class="text-danger">{contentEditor.error}</span>

	else
		return <b>Document Ok.</b>
}

export default function ContentEditor({metaEditor, read, write, deps, saveLabel}) {
	let tc=useTemplateContext();
	tc.set({tight: true});

	let editor=useEditor({
		contentRenderer: katnip.contentRenderer,
	});

	let form=useForm({
		initial: async ()=>{
			let data=await read();
			editor.setDoc(data.content);

			return data;
		},
		deps: deps
	});

	let contentEditor=useInstance(ContentEditorState,editor,form);
	useEventUpdate(contentEditor,"change");

	async function writeClick() {
		let saveData=form.getCurrent();
		saveData.content=editor.doc;

		let saved=await write(saveData);
		form.setCurrent(saved);
	}

	if (!form.getCurrent())
		return;

	let MetaEditor=metaEditor;

	return (
		<div style="width: 100%; height: calc( 100% - 40px )" class="d-flex flex-column">
			<style>{`
				button.btn-outline-primary .btn-image {
					filter: invert(30%) sepia(100%) saturate(1483%) hue-rotate(203deg) brightness(96%) contrast(108%);
				}

				button.btn-primary .btn-image,
				button.btn-outline-primary:hover .btn-image {
					filter: invert(100%) sepia(19%) saturate(1%) hue-rotate(216deg) brightness(108%) contrast(102%);
				}
			`}</style>
			<div class="bg-light p-3 border-bottom d-flex flex-row">
				<button class={`btn btn-primary me-2 ${contentEditor.leftMode=="tree"?"active":""} align-text-bottom`}
						style="height: 2.4em"
						onclick={bindArgs(contentEditor.toggleLeftMode,"tree")}>
					<img src={LIST_NESTED} style={`${whiteFilter}`}/>
				</button>
				<button class={`btn btn-primary me-2 ${contentEditor.leftMode=="components"?"active":""} align-text-bottom`}
						style="height: 2.4em"
						onclick={bindArgs(contentEditor.toggleLeftMode,"components")}>
					<img src={PLUS_LG} style={`${whiteFilter}`}/>
				</button>
				<button class={`btn me-2 align-text-bottom ${contentEditor.codeMode?"btn-primary":"btn-outline-primary"}`}
						style="height: 2.4em"
						onclick={contentEditor.toggleCodeMode}>
					<img src={CODE_SLASH} class="btn-image"/>
				</button>
				<h2 class="d-inline-block mb-0 me-auto">{form.getCurrent().title}</h2>
				<button class={`btn btn-primary ms-2 ${contentEditor.rightMode=="component"?"active":""} align-text-bottom`}
						style="height: 2.4em"
						onclick={bindArgs(contentEditor.toggleRightMode,"component")}>
					<img src={PUZZLE_FILL} style={`${whiteFilter}`}/>
				</button>
				<button class={`btn btn-primary ms-2 ${contentEditor.rightMode=="document"?"active":""} align-text-bottom`}
						style="height: 2.4em"
						onclick={bindArgs(contentEditor.toggleRightMode,"document")}>
					<img src={FILE_EARMARK_TEXT_FILL} style={`${whiteFilter}`}/>
				</button>
				<PromiseButton class={`btn btn-primary ms-2`} onclick={writeClick}>
					{saveLabel}
				</PromiseButton>
			</div>
			<div class="flex-grow-1 d-flex flex-row" style="overflow: hidden;">
				{contentEditor.leftMode=="tree" &&
					<div class="bg-light border-end p-3 flex-shrink-0" style="width: 25%; overflow: scroll;">
						<EditorStructure editor={editor} />
					</div>
				}
				{contentEditor.leftMode=="components" &&
					<div class="bg-light border-end p-3 flex-shrink-0" style="width: 25%">
						<ComponentLibrary editor={editor} toggleLeftMode={contentEditor.toggleLeftMode}/>
					</div>
				}

				{contentEditor.codeMode && 
					<div class="flex-grow-1" style="overflow: hidden;">
						<CodeEditor contentEditor={contentEditor}/>
					</div>
				}
				{!contentEditor.codeMode &&
					<div class="flex-grow-1" style="overflow: scroll;">
						<Editor class="m-3" editor={editor}/>
					</div>
				}

				{contentEditor.rightMode=="component" &&
					<div class="bg-light border-start p-3 flex-shrink-0" style="width: 25%">
						<ComponentProperties editor={editor}/>
					</div>
				}
				{contentEditor.rightMode=="document" &&
					<div class="bg-light border-start p-3 flex-shrink-0" style="width: 25%">
						<MetaEditor form={form}/>
					</div>
				}
			</div>
			<div class="bg-light border-top px-3 py-1 small">
				{contentEditor.codeMode &&
					<CodeEditorStatus contentEditor={contentEditor} />
				}
				{!contentEditor.codeMode &&
					<EditorPath editor={editor}/>
				}
			</div>
		</div>
	);
}
