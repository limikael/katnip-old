import {katnip, Model} from "katnip";

class Term extends Model {
	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT",
		taxonomy: "VARCHAR(255) NOT NULL",
		title: "VARCHAR(255) NOT NULL",
		slug: "VARCHAR(255) NOT NULL",
		parentTermId: "INTEGER"
	}
}

katnip.addAction("getPluginBundles",(bundles)=>{
	bundles.admin.push("katnip-templates/components/TaxonomyAdmin.jsx");
});

/*katnip.addApi("/api/getTerms",async ({taxonomy},req)=>{

});*/