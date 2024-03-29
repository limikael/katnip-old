import EventEmitter from "events";
import {docGetNode, docGetChildPaths, docReplaceNode, docAddNode, docAddNodeSibling,
		docSetNodeProps, docGetStructure, docRemoveNode, docFragmentToXml,
		docFragmentFromXml, validateXml} from "./doc-util.js";
import {arrayEqualsShallow} from "../utils/js-util.js";

export default class EditorState extends EventEmitter {
	constructor(options) {
		super();

		this.doc=options.doc;
		this.contentRenderer=options.contentRenderer;
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

	getDocumentStateHash() {
		return JSON.stringify(docGetStructure(this.getWrappedDoc()));
	}

	setEl=(ref)=>{
		this.el=ref;
	}

	getXml() {
		return docFragmentToXml(this.doc);
	}

	setXml(xmlFragment) {
		let doc=docFragmentFromXml(xmlFragment);
		this.setDoc(doc);
	}

	validateXml(xmlFragment) {
		return validateXml(xmlFragment);
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
			let startIndex=this.startOffset;
			let endIndex=this.endOffset;

			if (!arrayEqualsShallow(this.startPath,this.endPath))
				endIndex=parent.length;

			if (startIndex<0)
				startIndex=endIndex=parent.length;

			if (typeof node=="string") {
				this.replaceDocNode(path,parent.slice(0,startIndex)+node+parent.slice(endIndex));
				this.select(path,endIndex+node.length);
			}

			else {
				if (!node.children)
					node.children=[];

				if (endIndex!=startIndex)
					node.children.push(parent.slice(startIndex,endIndex));

				this.replaceDocNode(path,parent.slice(0,startIndex));
				this.setWrappedDoc(docAddNodeSibling(this.getWrappedDoc(),path,parent.slice(endIndex)));
				this.setWrappedDoc(docAddNodeSibling(this.getWrappedDoc(),path,node));

				let i=path.pop();
				this.select([...path,i+1]);
			}
		}

		else {
			let index=this.getDocNode(path).children.length;
			this.setWrappedDoc(docAddNode(this.getWrappedDoc(),path,node));

			if (typeof node=="string")
				this.select([...path,index],node.length);

			else
				this.select([...path,index]);
		}
	}

	removeDocNode(path) {
		if (!path)
			return;

		this.setWrappedDoc(docRemoveNode(this.getWrappedDoc(),path));
	}

	deleteSelected() {
		this.removeDocNode(this.startPath);
		this.select();
	}

	setDocNodeProps(path, props) {
		this.setWrappedDoc(docSetNodeProps(this.getWrappedDoc(),path,props));
	}

	focus() {
		if (this.el)
			this.el.focus();
	}
}