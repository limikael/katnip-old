import EventEmitter from "events";

export default class ContentEditorState extends EventEmitter {
	constructor(editor, form) {
		super();

		this.editor=editor;
		this.form=form;

		this.codeMode=false;
		this.rightMode="document";
		this.leftMode=null;
	}

	setXml=(xml)=>{
		this.xml=xml;
		this.error=this.editor.validateXml(xml);
		if (!this.error)
			this.validXml=xml;

		this.emit("change");
	}

	toggleLeftMode=(mode)=>{
		if (this.leftMode==mode)
			mode=null;

		this.leftMode=mode;
		this.emit("change");

//			setCodeMode(false);
	}

	toggleRightMode=(mode)=>{
		if (this.rigthMode==mode)
			mode=null;

		this.rightMode=mode;
		this.emit("change");
	}

	toggleCodeMode=()=>{
		if (this.codeMode) {
			this.editor.setXml(this.validXml);
			this.codeMode=false;
		}

		else {
			this.codeMode=true;
			this.validXml=this.editor.getXml();
			this.xml=this.validXml;
			this.error=null;
			this.leftMode=null;
		}

		this.emit("change");
	}
}
