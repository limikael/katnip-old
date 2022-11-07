import {useApiFetch, BsAlert, renderFragment, setTemplateContext} from "katnip";
import {useState} from "react";

export default function PageView({request, renderMode}) {
	let pageQuery=request.pathargs[1];
	let page=useApiFetch("/api/getPageView",{query: pageQuery},[pageQuery]);

	if (!page)
		return (<div class="spinner-border m-3"/>);

	if (page instanceof Error)
		return <div class="mt-5"><BsAlert message={page}/></div>;

	if (!page.meta.hideTitle)
		setTemplateContext("title",page.title);

	return renderFragment(page.content,{renderMode: renderMode});
}