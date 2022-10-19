import {createElement} from "react";

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

export default class ContentRenderer {
	constructor() {
		this.elements=[];
	}

	addElement=(...args)=> {
		function itemOfType(a,t) {
			for (let e of a)
				if (typeof e==t)
					return e;
		}

		let def=itemOfType(args,"object");
		if (!def)
			def={};

		let s=itemOfType(args,"string");
		if (s) {
			if (!def.type) def.type=s;
			if (!def.component) def.component=s;
		}

		let fn=itemOfType(args,"function");
		if (fn) {
			//if (!def.type) def.type=fn.name;
			if (!def.controls) def.controls=fn.controls;
			if (!def.default) def.default=fn.default;
			if (fn.internal) def.internal=fn.internal;

			def.component=fn;
		}

		if (!def.controls)
			def.controls={};

		for (let k in def.controls)
			if (!def.controls[k].title)
				def.controls[k].title=k;

		if (!def.type || !def.component)
			throw new Error("Not enough info in component def "+JSON.stringify(def));

		//console.log(def);
		this.elements[def.type]=def;
	}

	renderNode=(node, options={})=>{
		if (typeof node=="string")
			return node.replace(/\s$/,"\u00A0").replace(/^\s/,"\u00A0");

		let children=this.renderFragment(node.children,options);
		let component=UndefinedComponent;
		if (this.elements[node.type])
			component=this.elements[node.type].component;

		if (!node.props)
			node.props={};

		let passProps={...node.props, renderMode: options.renderMode};

		if (options.renderMode=="editor") {
			if (typeof component=="string") {
				passProps["data-props"]=JSON.stringify(node.props);
				passProps["data-type"]=component;
			}

			else {
				passProps.outer={
					"data-props": JSON.stringify(node.props),
					"data-type": node.type,
					"data-outer": true,
				};
				passProps.inner={
					"data-inner": true
				};
			}
		}

		else {
			if (typeof component!="string") {
				passProps.outer={};
				passProps.inner={};
			}			
		}

		return createElement(component,passProps,...children);
	}

	renderFragment=(nodes, options={})=>{
		if (!nodes || !nodes.length)
			return [];

		return nodes.map((n)=>this.renderNode(n, options));
	}
}