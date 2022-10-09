import {useTemplateContext, useApiFetch, BsAlert, renderFragment} from "katnip";

export default function PageView({request}) {
	let tc=useTemplateContext();
	let pageQuery=request.pathargs[1];
	let page=useApiFetch("/api/getPageView",{query: pageQuery},[pageQuery]);

	if (!page)
		return;

	if (page instanceof Error)
		return <div class="mt-5"><BsAlert message={page}/></div>;

	if (!page.meta.hideTitle)
		tc.set({title: page.title});

	return renderFragment(page.content);
}