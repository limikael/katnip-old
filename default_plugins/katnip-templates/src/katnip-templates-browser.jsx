import {katnip, lazyComponent} from "katnip";
import LIST_NESTED from "bootstrap-icons/icons/list-nested.svg";

katnip.addAction("getTaxonomies",(taxonomies)=>{
	taxonomies.category={title: "Category", pluralTitle: "Categories", hierarchial: true};
	taxonomies.tags={title: "Tag", pluralTitle: "Tags"};
});

katnip.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Taxonomies",
		href: "/admin/taxonomy",
		priority: 40,
		icon: LIST_NESTED
	});
});

katnip.addRoute("admin/taxonomy",lazyComponent("admin","TaxonomyAdmin"));
