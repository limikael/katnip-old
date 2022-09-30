import {useEditor, EditorContent} from '@tiptap/react';
import {useState, useEffect, useRef} from "react";
import StarterKit from '@tiptap/starter-kit';
import LIST_NESTED from "bootstrap-icons/icons/list-nested.svg";
import PLUS_LG from "bootstrap-icons/icons/plus-lg.svg";
import PUZZLE_FILL from "bootstrap-icons/icons/puzzle-fill.svg";
import FILE_EARMARK_TEXT_FILL from "bootstrap-icons/icons/file-earmark-text-fill.svg";
import {katnip, bindArgs, BsInput, useForm, PromiseButton, apiFetch, setLocation, buildUrl, A} from "katnip";
import {mergeAttributes, Node} from '@tiptap/core'
import {ReactNodeViewRenderer} from '@tiptap/react'
import {NodeViewContent, NodeViewWrapper} from '@tiptap/react'

// ref: https://tiptap.dev/guide/node-views/react
// https://tiptap.dev/guide/node-views/js
// https://tiptap.dev/guide/node-views/react#render-a-react-component
// https://tiptap.dev/guide/custom-extensions
// https://tiptap.dev/api/schema#the-node-schema

const whiteFilter="filter: invert(100%) sepia(19%) saturate(1%) hue-rotate(216deg) brightness(108%) contrast(102%);";
let elementEditors;

function TreeNode({tree}) {
	return (<>
		<li>{tree.type}</li>
		{tree.content &&
			<ul>
				{tree.content.map((node)=><TreeNode tree={node}/>)}
			</ul>
		}
	</>);
}

function EditorStructure({tree}) {
	if (!tree)
		return;

	//console.log(tree);

	return (<>
		<b>Structure</b>
		{tree.content &&
			<ul>
				{tree.content.map((node)=><TreeNode tree={node}/>)}
			</ul>
		}
	</>)
}

function ComponentList({editor}) {
	if (!editor)
		return;

	let buttons=[
		{name: "Bold", fn: ()=>editor.chain().focus().toggleBold().run()},
		{name: "Italic", fn: ()=>editor.chain().focus().toggleItalic().run()},
		{name: "List", fn: ()=>editor.chain().focus().toggleBulletList().run()},
		{name: "Heading", fn: ()=>editor.chain().focus().toggleHeading({ level: 2 }).run()}
	];

	function addComponent(name) {
		editor.commands.insertContent({
			type: name
		});
	}

	return (<>
		<b>Text</b>
		<p>
		{buttons.map(button=>
			<button class="btn btn-secondary btn-sm m-1" onclick={button.fn}>{button.name}</button>
		)}
		</p>
		<b>Components</b>
		<p>
		{Object.entries(katnip.elements).map(([name,fn])=>
			<button class="btn btn-secondary btn-sm m-1"
					onclick={bindArgs(addComponent,name)}>
				{name}
			</button>
		)}
		</p>
	</>);
}

function createElementEditor(elementName) {
	let Element=katnip.elements[elementName];

	function WrappedNode(props) {
		return (
			<NodeViewWrapper className="react-component">
				<Element {...props.node.attrs}/>
			</NodeViewWrapper>
		);
	}

	return Node.create({
		name: elementName,
		group: 'block',
		content: 'inline*',

		addAttributes() {
			let attrs={};

			if (Element.options && Element.options.controls) {
				for (let k in Element.options.controls) {
					attrs[k]={};
				}
			}

			return attrs;
		},

		parseHTML() {
			return [{
				tag: elementName,
			}];
		},

		renderHTML({ HTMLAttributes }) {
			return [elementName,mergeAttributes(HTMLAttributes),0];
		},

		addNodeView() {
			return ReactNodeViewRenderer(WrappedNode);
		},
	});
}

function EditorPath({editor}) {
	if (!editor)
		return;

	let headPos=editor.state.selection.$head;
	let els=[];

	for (let i=0; i<headPos.depth+1; i++) {
		if (i)
			els.push(<span class="mx-1">&raquo;</span>);

		els.push(<span>{headPos.node(i).type.name}</span>)
	}

	return els;
}

function getCurrentNode(editor) {
	let headPos=editor.state.selection.$head;
	let node=headPos.node(headPos.depth);

	return node;
}

function ComponentProperties({editor}) {
	let node=getCurrentNode(editor);

	if (!node || !katnip.elements[node.type.name])
		return;

	let controls={};
	if (katnip.elements[node.type.name].options?.controls)
		controls=katnip.elements[node.type.name].options.controls;

	function onAttrChange(ev) {
		let id=ev.target.dataset.id;
		let update={};
		update[id]=ev.target.value;

		editor.commands.updateAttributes(node.type,update);
	}

	return <>
		<div class="mb-3"><b>{node.type.name}</b></div>
		{Object.entries(controls).map(([id,control])=>
			<div class="form-group mb-3">
				<label class="form-label mb-1">{control.title}</label>
				<BsInput {...control} 
						value={node.attrs[id]}
						onchange={onAttrChange}
						data-id={id}/>
			</div>
		)}
	</>;
}

function DocumentProperties({editor, documentForm}) {
	let page=documentForm.getCurrent();

	let url;
	if (page.slug)
		url=window.location.origin+"/page/"+page.slug;

	let urlStyle={
		"white-space": "nowrap",
		"overflow": "hidden",
		"text-overflow": "ellipsis",
		display: "block",
		direction: "rtl"
	};

	return <>
		<div class="mb-3"><b>Document</b></div>
		<div class="form-group mb-3">
			<label class="form-label mb-1">Title</label>
			<BsInput {...documentForm.field("title")} />
		</div>
		{url &&
			<div class="form-group mb-3">
				<label class="form-label mb-0">Permalink</label>
				<A style={urlStyle} href={url}>{url}</A>
			</div>
		}
	</>;
}

export default function PageEdit({request}) {
	if (!elementEditors) {
		elementEditors=[];

		for (let k in katnip.elements)
			elementEditors.push(createElementEditor(k));
	}

	let [leftMode,setLeftMode]=useState();
	let [rightMode,setRightMode]=useState("document");

	let editor=useEditor({
		extensions: [
			StarterKit, ...elementEditors
		]
	});

	let editorRef=useRef();
	editorRef.current=editor;

	let documentForm=useForm({
		initial: async ()=>{
			let data={content: "", title: "New Page"};

			if (request.query.id)
				data=await apiFetch("/api/page/get",{id: request.query.id});

			if (editorRef.current)
				editorRef.current.commands.setContent(data.content);

			return data;
		},
		deps: [request.query.id]
	});

	let initializedRef=useRef();
	if (editor && !initializedRef.current) {
		initializedRef.current=true;
		if (documentForm.getCurrent())
			editorRef.current.commands.setContent(documentForm.getCurrent().content);
	}

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

	async function write() {
		let saveData=documentForm.getCurrent();
		saveData.content=editor.getHTML();

		let saved=await apiFetch("/api/page/save",saveData);
		setLocation(buildUrl("/admin/page",{id: saved.id}));
		documentForm.setCurrent(saved);
	}

	if (!editor || !documentForm.getCurrent())
		return;

	return (
		<div style="width: 100%; height: calc( 100% - 40px )" class="d-flex flex-column">
			<style>{`
				.ProseMirror {
					height: 100%;
				}
				.ProseMirror:focus {
					outline: none;
				}
			`}</style>
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
				<PromiseButton class={`btn btn-primary ms-2`} onclick={write}>
					{request.query.id?"Update Page":"Create New Page"}
				</PromiseButton>
			</div>
			<div class="flex-grow-1 d-flex flex-row" style="overflow: hidden;">
				{leftMode=="tree" &&
					<div class="bg-light border-end p-3" style="width: 25%">
						<EditorStructure tree={editor?.getJSON()}/>
					</div>
				}
				{leftMode=="components" &&
					<div class="bg-light border-end p-3" style="width: 25%">
						<ComponentList editor={editor}/>
					</div>
				}
				<div class="flex-grow-1 p-3" style="overflow-y: scroll;">
					<EditorContent editor={editor}/>
				</div>
				{rightMode=="component" &&
					<div class="bg-light border-start p-3" style="width: 25%">
						<ComponentProperties editor={editor}/>
					</div>
				}
				{rightMode=="document" &&
					<div class="bg-light border-start p-3" style="width: 25%">
						<DocumentProperties editor={editor} documentForm={documentForm}/>
					</div>
				}
			</div>
			<div class="bg-light border-top px-3 py-1 small">
				<EditorPath editor={editor}/>
			</div>
		</div>
	);
}