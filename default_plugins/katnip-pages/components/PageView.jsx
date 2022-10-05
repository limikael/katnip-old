import {katnip, A, ItemList, setLocation, buildUrl, renderElementContent} from "katnip";
import {useApiFetch, apiFetch, useForm, useCounter, useValueChanged, useChannel, BsAlert} from "katnip";
import {useState, useContext, createElement, Fragment} from "react";

katnip.addElement("Img",(props)=>{
	return <img {...props}/>
});

export default function PageView({request}) {
	let tc=katnip.useTemplateContext();
	let pageQuery=request.pathargs[1];
	let page=useApiFetch("/api/getPageView",{query: pageQuery},[pageQuery]);

	if (!page)
		return;

	if (page instanceof Error)
		return <div class="mt-5"><BsAlert message={page}/></div>;

	if (!page.meta.hideTitle)
		tc.set({title: page.title});

	return renderElementContent(page.content);
}