import {createElement, useRef, useEffect, useLayoutEffect, useState} from "react";
import {useEventListener, useInstance, useEventUpdate} from "../utils/react-util.jsx";
import EditorState from "./EditorState.js";
import {getBoundingRectSafe} from "./dom-util.js";

function UndefinedComponent({outer, inner, children}) {
	return (
		<div {...outer} class="m-1 p-1 bg-warning rounded">
			<span class="text-white fw-bold">Undefined: {outer["data-type"]}</span>
			<div {...inner} class="p-1 bg-white rounded">
				{children}
			</div>
		</div>
	);
}

function makeReactComponent(node, elements) {
	if (typeof node=="string")
		return node.replace(/\s$/,"\u00A0").replace(/^\s/,"\u00A0");

	let children=makeReactComponents(node.children,elements);
	let component=UndefinedComponent;
	if (elements[node.type])
		component=elements[node.type].component;

	let props={...node.props};
	if (typeof component=="string") {
		props["data-props"]=JSON.stringify(props);
		props["data-type"]=component;
	}

	else {
		props.outer={
			"data-props": JSON.stringify(props),
			"data-type": node.type,
			"data-outer": true,
		};
		props.inner={
			"data-inner": true
		};
	}

	return createElement(component,props,...children);
}

function makeReactComponents(nodes, elements) {
	if (!nodes || !nodes.length)
		return [];

	return nodes.map((n,i)=>makeReactComponent(n,elements));
}

function getNodePath(parent, child) {
	if (parent==child)
		return [];

	if (!child.docParentNode)
		return null;

	let index=child.docParentNode.docChildNodes.indexOf(child);

	return [...getNodePath(parent,child.docParentNode),index];
}

function getChildNodeByPath(el, path) {
	if (!path.length)
		return el;

	return getChildNodeByPath(el.docChildNodes[path[0]],path.slice(1));
}

function getContentFromDom(el) {
	if (el.nodeName=="#text" || el.dataset.type=="text")
		return el.textContent;

	let type=el.dataset.type;
	if (!type)
		type=el.nodeName.toLowerCase();

	let props={};
	if (el.dataset.props)
		props=JSON.parse(el.dataset.props);

	return {
		type: type,
		props: props,
		children: getContentFromDomChildren(el)
	}
}

function getContentFromDomChildren(el) {
	return el.docChildNodes.map(childEl=>getContentFromDom(childEl));
}

function findInner(el) {
	if (el.dataset && el.dataset.inner)
		return el;

	for (let childNode of el.childNodes) {
		let cand=findInner(childNode);
		if (cand)
			return cand;
	}
}

function markDocNodes(el) {
	let domParent=el;
	if (el.dataset && el.dataset.outer)
		domParent=findInner(el);

	if (!domParent) {
		el.docChildNodes=[];
		return;
	}

	el.docChildNodes=Array.from(domParent.childNodes);
	for (let ch of el.docChildNodes) {
		ch.docParentNode=el;
		markDocNodes(ch);
	}
}

function isInner(node) {
	if (node.dataset && node.dataset.inner)
		return true;

	if (["#text","B","I"].includes(node.nodeName))
		return isInner(node.parentNode);

	return false;
}

function isNodeChildOf(parent, child) {
	if (!child)
		return false;

	if (parent==child)
		return true;

	if (!child.parentNode)
		return false;

	return isNodeChildOf(parent,child.parentNode);
}

function makeSelectionRect(el, rect) {
	el.style.position="absolute";
	el.style.border="1px solid red";
	el.style.backgroundColor="rgba(255, 0, 0, 0.25)";
	el.style.left=rect.x+"px";
	el.style.top=rect.y+"px";
	el.style.width=rect.width+"px";
	el.style.height=rect.height+"px";
	el.style.boxSizing="border-box";
	el.style.pointerEvents="none";
	el.style.display="block";
}

export function useEditor(options) {
	let editor=useInstance(EditorState,options);
	useEventUpdate(editor,"change");

	return editor;
}

export function Editor({editor, ...props}) {
	let selRef=useRef();
//	useEventUpdate(editor,"change");

	useEventListener(window.document,"selectionchange",()=>{
		let sel=window.getSelection();
		if (!sel.rangeCount)
			return;

		let range=sel.getRangeAt(0);

		if (!isNodeChildOf(editor.el,range.startContainer))
			return;

		markDocNodes(editor.el);

		let backward=false;
		if (sel.focusNode==range.startContainer &&
				sel.focusOffset==range.startOffset &&
				!range.collapsed)
			backward=true;

		editor.select(
			getNodePath(editor.el,range.startContainer),
			range.startOffset,
			getNodePath(editor.el,range.endContainer),
			range.endOffset,
			backward
		);
	});

	function onInput() {
		let range=window.getSelection().getRangeAt(0);

		markDocNodes(editor.el);
		editor.setDoc(getContentFromDomChildren(editor.el));
		editor.select(
			getNodePath(editor.el,range.startContainer),
			range.startOffset,
			getNodePath(editor.el,range.endContainer),
			range.endOffset
		);
	}

	useLayoutEffect(()=>{
		//editor.scrollEl.scrollTop=editor.scrollTop;
		//console.log("Scrolltop: "+editor.scrollTop);

		markDocNodes(editor.el);

		switch (editor.getSelectionMode()) {
			case "range":
				/*if (!isNodeChildOf(editor.el,document.activeElement) &&
						document.activeElement!=document.body)
					return;*/

				editor.el.contentEditable=true;

				let sel=window.getSelection();
				sel.removeAllRanges();

				let range=document.createRange();
				if (editor.selectBackward) {
					range.setStart(getChildNodeByPath(editor.el,editor.endPath),editor.endOffset);
					sel.addRange(range);
					sel.extend(getChildNodeByPath(editor.el,editor.startPath),editor.startOffset);
				}

				else {
					range.setStart(getChildNodeByPath(editor.el,editor.startPath),editor.startOffset);
					sel.addRange(range);
					sel.extend(getChildNodeByPath(editor.el,editor.endPath),editor.endOffset);
				}

				selRef.current.style.display="none";
				break;

			case "block":
				editor.el.contentEditable=false;

				let selected=getChildNodeByPath(editor.el,editor.startPath);
				let rect=getBoundingRectSafe(selected);
				let editorRect=getBoundingRectSafe(editor.el);

				rect.y-=editorRect.y;
				rect.x-=editorRect.x;

				makeSelectionRect(selRef.current,rect);
				break;
		}
	},[editor.getSelectionStateHash()]);

	function onKeyDown(ev) {
		if (ev.key=="Enter") {
			markDocNodes(editor.el);

			let range=window.getSelection().getRangeAt(0);
			if (isInner(range.startContainer))
				ev.preventDefault();
		}
	}

	return (
		<div style="position: relative;" class={props.class}>
			<div oninput={onInput} 
					ref={editor.setEl} 
					style="outline: none"
					key={JSON.stringify(editor.doc)}
					onkeydown={onKeyDown}
					contentEditable={true}>
				{makeReactComponents(editor.doc,editor.elements)}
			</div>
			<div ref={selRef}/>
		</div>
	);
}