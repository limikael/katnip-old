import {useContext, createContext, useRef, useEffect, useLayoutEffect} from "react";
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
			//console.log("removed, len="+JSON.stringify(this.loadingResources));
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

	useEventUpdate(managerRef.current,"change");

	//console.log("loading: "+managerRef.current.isLoading());

	let style="display: block";
	if (managerRef.current.isLoading())
		style="display: none";

	return (
		<BlockerContext.Provider value={managerRef.current}>
			<div style={style} class="resource-blocker">
				{children}
			</div>
		</BlockerContext.Provider>
	);
}

export function useBlockingResource(id) {
	let resourceManager=useContext(BlockerContext);
	let ref=useRef({});

	if (id!=ref.current.id) {
		resourceManager.removeResourceId(ref.current.id);
		ref.current={id: id};
	}

	useLayoutEffect(()=>{
		if (!ref.current.complete)
			resourceManager.addResourceId(ref.current.id);

		return ()=>{
			resourceManager.removeResourceId(ref.current.id);
		}
	},[ref.current.id]);

	return ()=>{
		ref.current.complete=true;
		resourceManager.removeResourceId(ref.current.id);
	}
}
