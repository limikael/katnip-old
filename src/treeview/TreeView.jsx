import {useState, useRef, useEffect} from "react";
import {useInstance, useEventUpdate, useEventListener} from "../utils/react-util.jsx";
import TreeState from "./TreeState.js";
import {numItemsIncludingChildren, itemDepth, localCoords} from "./tree-util.js";

function TreeNode({data, treeState, row, path}) {
	let ItemRenderer=treeState.itemRenderer;
	let dragRef=useRef();

	function onDragStart(ev) {
		ev.stopPropagation();

		let offs=localCoords(dragRef.current,{x: ev.clientX,y: ev.clientY});
		treeState.setDragOffset(offs);

		let t=treeState.translateEventCoords(ev);
		treeState.startDrag(t,numItemsIncludingChildren(data));
	}

	function onDrag(ev) {
		ev.stopPropagation();
		if (!ev.screenX && !ev.screenY && !ev.clientX && !ev.clientY)
			return;

		let t=treeState.translateEventCoords(ev);
		treeState.setTarget(t);
	}

	function onDragEnd(ev) {
		ev.stopPropagation();
		treeState.endDrag();
	}

	let depth=itemDepth(data);
	let outerStyle={
		width: (treeState.itemWidth+(depth-1)*treeState.itemIndent)+"px"
	};

	let innerStyle={
		height: treeState.itemHeight+"px",
		width: treeState.itemWidth+"px",
		marginBottom: treeState.itemSpacing+"px"
	};

	let rendered=<ItemRenderer data={data} path={path}/>;
	if (treeState.target &&
			row>=treeState.target.row && 
			row<treeState.target.row+treeState.numDrag) {
		innerStyle.border="1px dashed black";
		innerStyle.boxSizing="border-box";
		rendered=null;
	}

	return (
		<div style={outerStyle}>
			<div draggable="true" ondragstart={onDragStart} ondrag={onDrag} ondragend={onDragEnd} ref={dragRef}>
				<div style={innerStyle}>
					{rendered}
				</div>
				<div style={{marginLeft: treeState.itemIndent+"px"}}>
					<TreeNodes datas={data.children} treeState={treeState} row={row+1} path={path}/>
				</div>
			</div>
		</div>
	);
}

function TreeNodes({datas, treeState, row, path}) {
	if (!datas)
		return;

	let els=[];
	let i=0;
	for (let data of datas) {
		els.push(<TreeNode data={data} treeState={treeState} row={row} path={[...path,i]}/>);
		row+=numItemsIncludingChildren(data);
		i++;
	}

	return els;
}

export function TreeView(props) {
	let treeState=useInstance(TreeState,props)
	treeState.setData(props.data);
	useEventUpdate(treeState,"update");
	useEventListener(treeState,"change",()=>{
		if (props.onchange)
			props.onchange(treeState.data);
	});
	let topDivRef=useRef();
	useEffect(()=>{
		treeState.topDiv=topDivRef.current;
	},[]);

	return (<>
		<div ref={topDivRef}>
			<TreeNodes
				row={0}
				datas={treeState.getViewData()}
				treeState={treeState}
				path={[]}/>
		</div>
	</>);
}