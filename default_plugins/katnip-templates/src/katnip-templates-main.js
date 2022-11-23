import {katnip, Model} from "katnip";
import "./katnip-templates-api.js";

class Term extends Model {
	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY",
		taxonomy: "VARCHAR(255) NOT NULL",
		title: "VARCHAR(255) NOT NULL",
		parentTermId: "INTEGER"
	}
}

katnip.addModel(Term);

katnip.addAction("getPluginBundles",(bundles)=>{
	bundles.admin.push("katnip-templates/components/TaxonomyAdmin.jsx");
});
