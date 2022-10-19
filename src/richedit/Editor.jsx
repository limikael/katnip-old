import {createElement, useRef, useEffect, useLayoutEffect, useState} from "react";
import {useEventListener, useInstance, useEventUpdate} from "../utils/react-util.jsx";
import EditorState from "./EditorState.js";
import {getBoundingRectSafe} from "./dom-util.js";

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

	useEventListener(window.document,"selectionchange",()=>{
		markDocNodes(editor.el);

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
		markDocNodes(editor.el);

		let range=window.getSelection().getRangeAt(0);
		editor.setDoc(getContentFromDomChildren(editor.el));
		editor.select(
			getNodePath(editor.el,range.startContainer),
			range.startOffset,
			getNodePath(editor.el,range.endContainer),
			range.endOffset
		);
	}

	useLayoutEffect(()=>{
		markDocNodes(editor.el);

		switch (editor.getSelectionMode()) {
			case "range":
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
				editor.el.focus();
				break;
		}
	},[editor.getSelectionStateHash()]);

	function onKeyPress(ev) {
		if (editor.getSelectionMode()=="block") {
			editor.addDocNodeAtCursor(String.fromCharCode(ev.charCode));
			ev.preventDefault();
		}
	}

	function onKeyDown(ev) {
		switch (ev.key) {
			case "Enter":
				markDocNodes(editor.el);
				let range=window.getSelection().getRangeAt(0);
				if (isInner(range.startContainer))
					ev.preventDefault();
				break;

			case "Delete":
			case "Backspace":
				if (editor.getSelectionMode()!="block")
					return;

				editor.deleteSelected();
				break;
		}
	}

	return (
		<div style="position: relative;" class={props.class}>
			<div oninput={onInput} 
					ref={editor.setEl} 
					style="outline: none"
					key={editor.getDocumentStateHash()}
					onkeydown={onKeyDown}
					onkeypress={onKeyPress}
					contentEditable={true}
					tabindex={0}>
				{editor.contentRenderer.renderFragment(editor.doc,{renderMode: "editor"})}
			</div>
			<div ref={selRef}/>
		</div>
	);
}