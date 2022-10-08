import EventEmitter from "events";
import {docGetNode, docGetChildPaths, docReplaceNode, docAddNode, docAddNodeSibling,
		docSetNodeProps} from "./doc-util.js";

export default class EditorState extends EventEmitter {
	constructor(options) {
		super();

		this.doc=options.doc;
		this.elements=options.elements;
		this.startPath=[];
		this.startOffset=0;
		this.endPath=[];
		this.endOffset=0;
		this.selectBackward=false;
	}

	setDoc(doc) {
		if (!Array.isArray(doc))
			throw new Error("The doc should be an array!");

		this.doc=doc;
		this.emit("change");
	}

	getWrappedDoc() {
		return {
			type: "#root",
			children: this.doc
		}
	}

	setWrappedDoc(wrappedDoc) {
		this.setDoc(wrappedDoc.children);
	}

	getSelectionMode() {
		if (this.startOffset>=0)
			return "range";

		return "block";
	}

	select(startPath, startOffset, endPath, endOffset, selectBackward) {
		selectBackward=!!selectBackward;

		if (JSON.stringify(startPath)==JSON.stringify(this.startPath) &&
				startOffset===this.startOffset &&
				JSON.stringify(endPath)==JSON.stringify(this.endPath) &&
				endOffset===this.endOffset &&
				selectBackward===this.selectBackward)
			return;

		if (!startPath) {
			this.startPath=[];
			this.startOffset=0;
			this.endPath=[];
			this.endOffset=0;
		}

		else if (startOffset<0 || startOffset===undefined) {
			this.startPath=startPath;
			this.startOffset=-1;
			this.endPath=startPath;
			this.endOffset=-1;
		}

		else if (!endPath) {
			this.startPath=startPath;
			this.startOffset=startOffset;
			this.endPath=startPath;
			this.endOffset=startOffset;
		}

		else {
			this.startPath=startPath;
			this.startOffset=startOffset;
			this.endPath=endPath;
			this.endOffset=endOffset;
		}

		this.selectBackward=selectBackward;
		this.emit("change");
	}

	getSelectionStateHash() {
		return JSON.stringify([
			this.startPath,this.startOffset,this.endPath,this.endOffset,this.selectBackward
		]);
	}

	setEl=(ref)=>{
		this.el=ref;
	}

	getDoc() {
		return this.doc;
	}

	getDocNode(path) {
		return docGetNode(this.getWrappedDoc(),path);
	}

	getDocChildPaths(path) {
		return docGetChildPaths(this.getWrappedDoc(),path);
	}

	replaceDocNode(path, newNode) {
		this.setWrappedDoc(docReplaceNode(this.getWrappedDoc(),path,newNode));
	}

	addDocNodeAtCursor(node) {
		let path=this.startPath;
		if (!path)
			path=[];

		let parent=this.getDocNode(path);

		if (typeof parent=="string") {
			let index=this.startOffset;
			if (index<0)
				index=parent.length;

			if (typeof node=="string") {
				this.replaceDocNode(path,parent.slice(0,index)+node+parent.slice(index));
				this.select(path,index+node.length);
			}

			else {
				this.replaceDocNode(path,parent.slice(0,index));
				this.setWrappedDoc(docAddNodeSibling(this.getWrappedDoc(),path,parent.slice(index)));
				this.setWrappedDoc(docAddNodeSibling(this.getWrappedDoc(),path,node));

				let i=path.pop();
				this.select([...path,i+1]);
			}
		}

		else {
			let index=this.getDocNode(path).children.length;
			this.setWrappedDoc(docAddNode(this.getWrappedDoc(),path,node));
			this.select([...path,index]);
		}
	}

	setDocNodeProps(path, props) {
		this.setWrappedDoc(docSetNodeProps(this.getWrappedDoc(),path,props));
	}

	focus() {
		if (this.el)
			this.el.focus();
	}

	notifyScroll=(ev)=>{
		console.log("scroll");
	}
}