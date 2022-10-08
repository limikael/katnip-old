import {useRef, useEffect, useState, useLayoutEffect, createElement} from "react";
import {getNodePath, getBoundingRectSafe, getChildNodeByPath, rectContains,
		getClosestNodeWithClasses} from "./dom-util.js";

function makeReactComponent(node, elements, ref) {
	if (typeof node=="string")
		return node.replace(/\s$/,"\u00A0").replace(/^\s/,"\u00A0");

	let children=[];
	if (node.children)
		for (let child of node.children)
			children.push(makeReactComponent(child,elements));

	let props={...node.props};
	if (ref)
		props.ref=ref;

	props.renderMode="editor";

	return createElement(elements[node.type],props,...children);
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

export default function EditorView({doc, path, cursorPos, onclick, ondrag, elements, forwardRef, rangeLen, ...props}) {
	let docRef=useRef(), selRef=useRef(), mouseRef=useRef({});

	useLayoutEffect(()=>{
		if (!path) {
			selRef.current.style.display="none";
			return;
		}

		let selected=getChildNodeByPath(docRef.current,path);
		let rect;

		// Text mode
		if (cursorPos!==undefined && cursorPos>=0) {
			let range=document.createRange();
			range.setStart(selected,cursorPos);
			range.setEnd(selected,cursorPos);
			rect=range.getBoundingClientRect();

			let sel=window.getSelection();
			sel.removeAllRanges();

			if (rangeLen) {
				range=document.createRange();
				if (rangeLen<0) {
					range.setStart(selected,cursorPos+rangeLen);
					range.setEnd(selected,cursorPos);
				}

				else {
					range.setStart(selected,cursorPos);
					range.setEnd(selected,cursorPos+rangeLen);
				}
				sel.addRange(range);
			}
		}

		// Node mode
		else {
			rect=getBoundingRectSafe(selected);
		}

		let editorRect=getBoundingRectSafe(docRef.current);

		rect.y-=editorRect.y;
		rect.x-=editorRect.x;

		makeSelectionRect(selRef.current,rect);

	},[path,cursorPos,rangeLen,JSON.stringify(doc)]);

	function resolveMouseEvent(ev) {
		let path=getNodePath(docRef.current,ev.target);
		let offset=-1;

		r=document.caretRangeFromPoint(ev.pageX, ev.pageY);
		let textParent=getClosestNodeWithClasses(r.startContainer,["child-container","component"]);
		if (!textParent || !textParent.classList.contains("component")) {
			let rect=getBoundingRectSafe(r.startContainer);
			if (rectContains(rect,ev.pageX,ev.pageY)) {
				let idx=Array.from(ev.target.childNodes).indexOf(r.startContainer);
				if (idx>=0) {
					path.push(idx);
					offset=r.startOffset;
				}
			}
		}

		return {path, offset};
	}

	function onMouseDown(ev) {
		ev.preventDefault();
		ev.stopPropagation();

		mouseRef.current.down=true;
		let resolved=resolveMouseEvent(ev);
		onclick(resolved.path,resolved.offset);
	}

	function onMouseUp(ev) {
		ev.preventDefault();
		ev.stopPropagation();

		mouseRef.current.down=false;
	}

	function onMouseMove(ev) {
		ev.preventDefault();
		ev.stopPropagation();

		if (mouseRef.current.down) {
			let resolved=resolveMouseEvent(ev);
			ondrag(resolved.path,resolved.offset);
		}
	}

	return (
		<div style={"position: relative; user-select: text; outline: none"} tabindex={0} ref={forwardRef} class={props.class}>
			<div onmousedown={onMouseDown} onmouseup={onMouseUp} onmousemove={onMouseMove}>
				{makeReactComponent(doc,elements,docRef)}
			</div>
			<div ref={selRef}/>
		</div>
	);
}
