import {useContext, createContext, useRef, useEffect} from "react";
import {useEventUpdate} from "./react-util.jsx";
import {arrayRemove} from "./js-util.js";
import EventEmitter from "events";

const BlockerContext=createContext();

class ResourceManager extends EventEmitter {
	constructor() {
		super();
		this.loadingResources=[];
	}

	addResourceId=(id)=>{
		if (id && !this.loadingResources.includes(id)) {
			this.loadingResources.push(id);
			this.emit("change");
		}
	}

	removeResourceId=(id)=>{
		if (id && this.loadingResources.includes(id)) {
			arrayRemove(this.loadingResources,id);
			this.emit("change");
		}
	}

	isLoading=()=>{
		return (this.loadingResources.length>0);
	}
}

export function ResourceBlocker({children}) {
	let managerRef=useRef();
	if (!managerRef.current)
		managerRef.current=new ResourceManager();

	useEventUpdate("change",managerRef.current);

	let style={};
	if (managerRef.current.isLoading())
		style={display: "none"};

	return (
		<BlockerContext.Provider value={managerRef.current}>
			<div style={style}>
				{children}
			</div>
		</BlockerContext.Provider>
	);
}

export function useBlockingResource(id) {
	let ref=useRef();
	let resourceManager=useContext(BlockerContext);
	useEffect(()=>{
		return ()=>{
			resourceManager.removeResourceId(ref.current);
		}
	},[]);

	if (ref.current!=id) {
		resourceManager.removeResourceId(ref.current);
		ref.current=id;
		resourceManager.addResourceId(ref.current);
	}

	return ()=>{
		resourceManager.removeResourceId(ref.current);
	}
}