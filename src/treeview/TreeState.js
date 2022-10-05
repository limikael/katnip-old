import EventEmitter from "events";
import {arrayMove} from "../utils/js-util.js";
import {localCoords, itemDepth, unindent, indent} from "./tree-util.js";

export default class TreeState extends EventEmitter {
	constructor(options) {
		super();

		for (let k in options)
			this[k]=options[k];

		this.source=null;
		this.target=null;
	}

	setData(data) {
		this.data=data;
	}

	setDragOffset(offs) {
		this.dragOffset=offs;
	}

	startDrag(source, num) {
		this.source=source;
		this.target=source;
		this.numDrag=num;
		this.emit("update");
	}

	setTarget(target) {
		if (target.row==this.target.row &&
				target.level==this.target.level)
			return;

		let rows=indent(JSON.parse(JSON.stringify(this.data)));

		if (target.row<0)
			target.row=0;

		if (target.row+this.numDrag>=rows.length)
			target.row=rows.length-this.numDrag;

		this.target=target;
		this.emit("update");
	}

	getViewData() {
		if (!this.source)
			return this.data;

		let rows=indent(JSON.parse(JSON.stringify(this.data)));
		let targetRow=this.target.row;
		let targetLevel=this.target.level;

		if (targetLevel<0)
			targetLevel=0;

		arrayMove(rows,this.source.row,targetRow,this.numDrag);

		if (!targetRow)
			targetLevel=0;

		else {
			if (typeof rows[targetRow-1].data=="string")
				targetLevel=Math.min(targetLevel,rows[targetRow-1].level);

			else
				targetLevel=Math.min(targetLevel,rows[targetRow-1].level+1);
		}

		if (rows[targetRow+this.numDrag])
			targetLevel=Math.max(targetLevel,rows[targetRow+this.numDrag].level);

		let diff=targetLevel-this.source.level;
		for (let i=targetRow; i<targetRow+this.numDrag; i++)
			rows[i].level+=diff;

		return unindent(rows);
	}

	endDrag() {
		this.data=this.getViewData();
		this.source=null;
		this.target=null;
		this.numDrag=0;
		this.emit("update");
		this.emit("change");
	}

	translateEventCoords(ev) {
		let pos=localCoords(this.topDiv,{x: ev.clientX, y: ev.clientY});
		pos.x-=this.dragOffset.x;
		pos.y-=this.dragOffset.y;

		let level=Math.round(pos.x/this.itemIndent);
		let row=Math.round(pos.y/(this.itemHeight+this.itemSpacing));

		return {level,row};
	}
}
