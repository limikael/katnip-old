import {useApiFetch, BsAlert, renderFragment, setTemplateContext} from "katnip";
import {useState} from "react";

export default function PageView({request}) {
	let pageQuery=request.pathargs[1];
	let page=useApiFetch("/api/getPageView",{query: pageQuery},[pageQuery]);

	if (!page)
		return;

	if (page instanceof Error)
		return <div class="mt-5"><BsAlert message={page}/></div>;

	if (!page.meta.hideTitle)
		setTemplateContext("title",page.title);

	return renderFragment(page.content);
}