import {useEditor, EditorContent} from '@tiptap/react';
import {useState} from "react";
import StarterKit from '@tiptap/starter-kit';
import LIST_NESTED from "bootstrap-icons/icons/list-nested.svg";
import PUZZLE_FILL from "bootstrap-icons/icons/puzzle-fill.svg";
import {bindArgs} from "katnip";
import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'

const whiteFilter="filter: invert(100%) sepia(19%) saturate(1%) hue-rotate(216deg) brightness(108%) contrast(102%);";

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

function WrappedPageCounter() {
	return (<>
		<NodeViewWrapper className="react-component-with-content">
			<katnip.elements.PageCounter/>

			{/*<NodeViewContent className="content" />*/}
		</NodeViewWrapper>
	</>);
}


let PageCounterComponent=Node.create({
  name: 'PageCounter',

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'page-counter',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['page-counter', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(WrappedPageCounter)
  },
});

function ComponentList({editor}) {
	if (!editor)
		return;

	let buttons=[
		{name: "Bold", fn: ()=>editor.chain().focus().toggleBold().run()},
		{name: "Italic", fn: ()=>editor.chain().focus().toggleItalic().run()},
		{name: "List", fn: ()=>editor.chain().focus().toggleBulletList().run()},
		{name: "Heading", fn: ()=>editor.chain().focus().toggleHeading({ level: 2 }).run()}
	];

	function addClicked() {
		console.log("adding...");
		//editor.commands.insertContent('<page-counter />');
		editor.commands.insertContent({
			type: "PageCounter"
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
			<button class="btn btn-secondary btn-sm m-1" onclick={addClicked}>{name}</button>
		)}
		</p>
	</>);
}

export default function PageEdit({request}) {
	let [leftMode,setLeftMode]=useState();
	let editor=useEditor({
		content: "<div>hello <b>world</b><ul><li>test</li></ul><page-counter /></div> ",
		extensions: [
			StarterKit,
			PageCounterComponent
		]
	});

	function toggleLeftMode(mode) {
		if (leftMode==mode)
			setLeftMode(null);

		else
			setLeftMode(mode);
	}

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
				Page &gt; Paragraph
			</div>
		</div>
	);
}