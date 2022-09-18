import {catnip, A, ItemList, setLocation, buildUrl} from "catnip";
import {useApiFetch, apiFetch, useForm, useCounter, useValueChanged, useChannel} from "catnip";
import {useState, useContext} from "preact/compat";
import XMLToReactModule from 'xml-to-react';

const XMLToReact=XMLToReactModule.default;

catnip.addElement("HideTitle",()=>{
	let tc=catnip.useTemplateContext();

	tc.setTitle("");
})

catnip.addElement("Img",(props)=>{
	return <img {...props}/>
});

export default function PageView({request}) {
	let tc=catnip.useTemplateContext();
	let pageQuery=request.pathargs[1];
	let pageInfo=useApiFetch("/api/getPageView",{query: pageQuery},[pageQuery]);
	let page=pageInfo;//useChannel(pageInfo?"pageContent":null,{id: pageInfo?.id});

	if (!page)
		return;

	if (page instanceof Error)
		return <div class="mt-5"><BsAlert message={page}/></div>;

	let tags=["h1","h2","h3","h4","h5","div","span","b","p","hr","small","br"];
	let options={};

	for (let tag of tags)
		options[tag]=(attrs)=>({type: tag, props: attrs});

	options["Fragment"]=(attrs)=>({type: Fragment, props: attrs});

	options["a"]=(attrs)=>({type: A, props: attrs});

	for (elementName in catnip.elements) {
		let elementFunc=catnip.elements[elementName];
		options[elementName]=(attrs)=>({type: elementFunc, props: attrs});
	}

	const xmlToReact=new XMLToReact(options);
	const reactTree=xmlToReact.convert(`<Fragment>${page.content}</Fragment>`);

	if (tc.title===null)
		tc.setTitle(page.title);

	return (<>
		{reactTree}
	</>);
}