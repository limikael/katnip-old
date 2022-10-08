import {useRef, useEffect, useState, createElement} from "react";
import {useEventListener, useForceUpdate, useInstance, useEventUpdate} from "../utils/react-util.jsx";
import EditorView from "./EditorView.jsx";
import EditorModel from "./EditorModel.js";

export function useEditor(options) {
	let editor=useInstance(EditorModel,options);
	useEventUpdate(editor,"change");

	return editor;
}

export function Editor({editor, ...props}) {
	ref=useRef();
	useEventUpdate(editor,"change");

	if (editor.focusQueued && ref.current) {
		editor.focusQueued=false;

		let sc;
		if (ref.current.parentNode)
			sc=ref.current.parentNode.scrollTop;

		ref.current.focus();

		if (ref.current.parentNode)
			ref.current.parentNode.scrollTop=sc;
	}

	useEventListener(window,"keypress",(ev)=>{
		if (document.activeElement!=ref.current)
			return;

		//console.log("key press...");

		if (ev.charCode==127)
			return;

		ev.preventDefault();
		ev.stopPropagation();

		if (typeof editor.getDocNode(editor.path)!="string") {
			let path=editor.path;
			if (!path)
				path=[];

			while (editor.getDocChildPaths(path).length)
				editor.removeDocNode([...path,0]);

			editor.addDocNode(path,String.fromCharCode(ev.charCode));
			editor.selectTextPos([...path,0],1);
		}

		else if (typeof editor.getDocNode(editor.path)=="string") {
			editor.clearCurrentTextRange();

			if (editor.cursorPos<0) {
				editor.replaceDocNode(editor.path,String.fromCharCode(ev.charCode));
				editor.selectTextPos(editor.path,1);
			}

			else {
				let s=editor.getDocNode(editor.path);
				s=s.slice(0,editor.cursorPos)+String.fromCharCode(ev.charCode)+s.slice(editor.cursorPos);
				editor.replaceDocNode(editor.path,s);
				editor.selectTextPos(editor.path,editor.cursorPos+1);
			}
		}
	});

	useEventListener(window,"keydown",(ev)=>{
		if (document.activeElement!=ref.current)
			return;

		//console.log("key down: "+ev.charCode);

		let s,node=editor.getDocNode(editor.path);
		if (!node && typeof node!="string")
			return;

		if (editor.cursorPos>=0) {
			if (typeof node!="string")
				throw new Error("Expected a string!!!");

			switch (ev.code) {
				case "ArrowLeft":
					editor.selectTextPos(editor.path,Math.max(0,editor.cursorPos-1));
					break;

				case "ArrowRight":
					editor.selectTextPos(editor.path,Math.min(node.length,editor.cursorPos+1));
					break;

				case "Backspace":
					if (editor.getSelectionMode()=="range")
						editor.clearCurrentTextRange();

					else {
						if (editor.cursorPos>0) {
							s=node.slice(0,editor.cursorPos-1)+node.slice(editor.cursorPos);
							editor.replaceDocNode(editor.path,s);
							editor.selectTextPos(editor.path,Math.min(node.length,editor.cursorPos-1));
						}
					}
					break;

				case "Delete":
					if (editor.getSelectionMode()=="range")
						editor.clearCurrentTextRange();

					else {
						s=node.slice(0,editor.cursorPos)+node.slice(editor.cursorPos+1);
						editor.replaceDocNode(editor.path,s);
					}
					break;
			}
		}

		else {
			if (!editor.path || !editor.path.length)
				return;

			switch (ev.code) {
				case "Backspace":
				case "Delete":
					editor.deleteSelected();
					break;
			}
		}
	});

	useEventListener(window,"cut",(ev)=>{
		if (document.activeElement!=ref.current)
			return;

		ev.preventDefault();
		ev.stopPropagation();
		editor.cutSelected();
	});

	useEventListener(window,"copy",(ev)=>{
		if (document.activeElement!=ref.current)
			return;

		ev.preventDefault();
		ev.stopPropagation();
		editor.copySelected();
	});

	useEventListener(window,"paste",(ev)=>{
		if (document.activeElement!=ref.current)
			return;

		ev.preventDefault();
		ev.stopPropagation();
		editor.paste();
	});

	function onClick(newPath, newCursorPos) {
		editor.focus();

		if (JSON.stringify(newPath)==JSON.stringify(editor.path)) {
			if (newCursorPos==editor.cursorPos)
				editor.selectPath(newPath);

			else
				editor.selectTextPos(newPath, newCursorPos);
		}

		else {
			editor.selectPath(newPath);

			let node=editor.getDocNode(editor.path);
			if (typeof node=="string")
				editor.selectTextPos(editor.path,newCursorPos);

			else
				editor.selectPath(editor.path);
		}
	}

	function onDrag(path, toCursorPos) {
		if (JSON.stringify(editor.path)!=JSON.stringify(path)) {
			//console.log("diff: "+JSON.stringify(path));
			editor.selectTextRange(editor.path,editor.cursorPos,editor.rangeLen);
			return;
		}

		editor.selectTextRange(editor.path,editor.cursorPos,toCursorPos-editor.cursorPos);
	}

	return (
		<EditorView
			doc={editor.doc}
			path={editor.path}
			cursorPos={editor.cursorPos}
			rangeLen={editor.rangeLen}
			elements={editor.elements}
			onclick={onClick}
			ondrag={onDrag}
			forwardRef={ref}
			class={props.class}/>
	)
}