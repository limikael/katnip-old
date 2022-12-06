import {isSsr, usePromise, BsAlert, useChannel} from "katnip";

/**
 * Lazy load a component.
 *
 * The Lazy component will lazily load the required module and render
 * the component after it is loaded. The component to be lazily loaded
 * should have been previously registered by hooking into
 * the getPluginBundles action. All props will be passed on to the loaded
 * component once it is loaded.
 *
 * @component React Components.Lazy
 * @param module:String The module id containing the component, e.g. admin.
 * @param symbol:String The symbol referenced symbol.
 */
export function Lazy(props) {
	if (isSsr())
		return (<div class="spinner-border m-3"/>);

	let bundleHash=useChannel("bundleHash");
	let importFn="/"+props.module+".mjs?hash="+bundleHash;
	let bundle=usePromise(async ()=>{
		return await import(importFn);
	});

	if (bundle===undefined)
		return (<div class="spinner-border m-3"/>);

	if (bundle instanceof Error)
		return <BsAlert message={bundle}/>

	let Component=bundle[props.symbol];
	if (!Component) {
		let e=new Error("Undefined symbol '"+props.symbol+"' in module '"+importFn+"'.");
		return <BsAlert message={e}/>
	}

	let p={...props};
	delete p.module;
	delete p.symbol;

	return <Component {...p}/>;
}

export function lazyComponent(module, symbol) {
	return (props)=><Lazy module={module} symbol={symbol} {...props}/>;
}