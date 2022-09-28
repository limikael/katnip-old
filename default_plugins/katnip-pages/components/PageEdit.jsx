import {useEditor, EditorContent} from '@tiptap/react';
import {useState} from "react";
import StarterKit from '@tiptap/starter-kit';
import LIST_NESTED from "bootstrap-icons/icons/list-nested.svg";
import PUZZLE_FILL from "bootstrap-icons/icons/puzzle-fill.svg";
import {katnip, bindArgs} from "katnip";
import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'

// ref: https://tiptap.dev/guide/node-views/react

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

	function WrappedNode() {
		return (
			<NodeViewWrapper className="react-component">
				<Element/>
			</NodeViewWrapper>
		);
	}

	return Node.create({
		name: elementName,
		group: 'block',
		content: 'inline*',

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

export default function PageEdit({request}) {
	if (!elementEditors) {
		elementEditors=[];

		for (let k in katnip.elements)
			elementEditors.push(createElementEditor(k));
	}

	let [leftMode,setLeftMode]=useState();
	let editor=useEditor({
		content: "<div>hello <b>world</b><ul><li>test</li></ul><PageCounter /></div> ",
		extensions: [
			StarterKit, ...elementEditors
		]
	});

	function toggleLeftMode(mode) {
		if (leftMode==mode)
			setLeftMode(null);

		else
			setLeftMode(mode);
	}

	/*if (editor)
		console.log(editor.state.selection.$head.path);*/

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
			<div class="bg-light p-3 border-bottom">
				<button class={`btn btn-primary me-2 ${leftMode=="tree"?"active":""}`}
						style="height: 2.4em"
						onclick={bindArgs(toggleLeftMode,"tree")}>
					<img src={LIST_NESTED} style={`${whiteFilter}`}/>
				</button>
				<button class={`btn btn-primary me-2 ${leftMode=="components"?"active":""}`}
						style="height: 2.4em"
						onclick={bindArgs(toggleLeftMode,"components")}>
					<img src={PUZZLE_FILL} style={`${whiteFilter}`}/>
				</button>
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
				<div class="bg-light border-start" style="width: 25%">hello</div>
			</div>
			<div class="bg-light border-top px-3 py-1 small">
				<EditorPath editor={editor}/>
			</div>
		</div>
	);
}