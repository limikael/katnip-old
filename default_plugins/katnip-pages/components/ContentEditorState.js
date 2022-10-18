import EventEmitter from "events";

export default class ContentEditorState extends EventEmitter {
	constructor(editor, form, showCodeErrorModal) {
		super();

		this.editor=editor;
		this.form=form;
		this.showCodeErrorModal=showCodeErrorModal;

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

	toggleLeftMode=async (mode)=>{
		if (!this.codeMode && this.leftMode==mode)
			mode=null;

		if (this.codeMode)
			await this.toggleCodeMode();

		if (this.codeMode)
			return;

		this.leftMode=mode;
		this.emit("change");
	}

	toggleRightMode=(mode)=>{
		if (this.rigthMode==mode)
			mode=null;

		this.rightMode=mode;
		this.emit("change");
	}

	toggleCodeMode=async ()=>{
		if (this.codeMode) {
			if (!this.error ||
					await this.showCodeErrorModal(this.error)) {
				this.editor.setXml(this.validXml);
				this.codeMode=false;
				this.editor.select();
			}
		}

		else {
			this.codeMode=true;
			this.validXml=this.editor.getXml();
			this.xml=this.validXml;
			this.error=null;
			this.editor.select();
		}

		this.emit("change");
	}
}
