import EventEmitter from "events";
import {docRemoveNode, docReplaceNode, docGetNode, docGetChildPaths, docAddNode,
		docAddNodeSibling, docSetNodeProps} from "./doc-util.js";

export default class EditorModel extends EventEmitter {
	constructor(options) {
		super();

		this.doc=options.doc;
		this.path=undefined;
		this.cursorPos=-1;
		this.rangeLen=0;
		this.elements=options.elements;
	}

	focus() {
		this.focusQueued=true;
		this.emit("change");
	}

	selectPath(path) {
		this.path=path;
		this.cursorPos=-1;
		this.rangeLen=0;
		this.emit("change");
	}

	selectTextPos(path, pos) {
		this.path=path;
		this.cursorPos=pos;
		this.rangeLen=0;
		this.emit("change");
	}

	selectTextRange(path, pos, len) {
		this.path=path;
		this.cursorPos=pos;
		this.rangeLen=len;
		this.emit("change");
	}

	getSelectionMode() {
		if (this.path && this.cursorPos>=0 && this.rangeLen)
			return "range";

		if (this.path && this.cursorPos>=0)
			return "text";

		if (this.path);
			return "node";
	}

	setDoc(doc) {
		this.doc=doc;
		this.emit("change");
	}

	getCurrentTextRange() {
		let node=this.getDocNode(this.path);
		if (typeof node!="string")
			return null;

		if (this.rangeLen<0)
			return node.slice(this.cursorPos+this.rangeLen,this.cursorPos)

		return node.slice(this.cursorPos,this.cursorPos+this.rangeLen);
	}

	clearCurrentTextRange() {
		let node=this.getDocNode(this.path);
		if (typeof node!="string")
			return null;

		if (this.cursorPos<0 || !this.rangeLen)
			return;

		if (this.rangeLen<0) {
			node=node.slice(0,this.cursorPos+this.rangeLen)+node.slice(this.cursorPos);		
			this.selectTextPos(this.path,this.cursorPos+this.rangeLen);
			this.replaceDocNode(this.path,node);
			return;
		}

		node=node.slice(0,this.cursorPos)+node.slice(this.cursorPos+this.rangeLen);		
		this.replaceDocNode(this.path,node);
		this.selectTextPos(this.path,this.cursorPos);
	}

	getDocNode(path) {
		return docGetNode(this.doc,path);
	}

	getDocChildPaths(path) {
		return docGetChildPaths(this.doc,path);
	}

	replaceDocNode(path, newNode) {
		this.setDoc(docReplaceNode(this.doc,path,newNode));
	}

	removeDocNode(path) {
		if (!path) {
			this.setDoc({
				type: "div",
				props: {},
				children: []
			});
			return;
		}

		this.setDoc(docRemoveNode(this.doc,path));
	}

	addDocNode(path, node) {
		if (!path)
			path=[];

		this.setDoc(docAddNode(this.doc,path,node));
	}

	addDocNodeAtCursor(node) {
		let path=this.path;
		if (!path)
			path=[];

		let parent=this.getDocNode(path);
		if (typeof parent=="string") {
			let index=this.cursorPos;
			if (index<0)
				index=parent.length;

			if (typeof node=="string") {
				this.replaceDocNode(path,parent.slice(0,index)+node+parent.slice(index));
				this.selectTextPos(path,index+node.length);
			}

			else {
				this.replaceDocNode(path,parent.slice(0,index));
				this.setDoc(docAddNodeSibling(this.doc,path,parent.slice(index)));
				this.setDoc(docAddNodeSibling(this.doc,path,node));

				let i=path.pop();
				this.selectPath([...path,i+1]);
			}
		}

		else {
			let index=this.getDocNode(path).children.length;
			this.setDoc(docAddNode(this.doc,path,node));

			path.push(index);
			this.selectPath(path);
		}
	}

	setDocNodeProps(path, props) {
		this.setDoc(docSetNodeProps(this.doc,path,props));
	}
}