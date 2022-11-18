import {katnip, Model} from "katnip";
import fs from "fs-extra";
import nodeCrypto from "crypto";

class Media extends Model {
	static fields={
		id: "VARCHAR(255) NOT NULL PRIMARY KEY",
		filename: "VARCHAR(255)",
		mimetype: "VARCHAR(255)",
		meta: "JSON"
	}

	constructor(values) {
		super(values);

		if (!this.meta)
			this.meta={};
	}

	getStorageFilename() {
		let exts={
			"image/jpeg": ".jpg",
			"image/png": ".png"
		}

		let ext="";
		if (exts[this.mimetype])
			ext=exts[this.mimetype];

		return katnip.getOption("media")+"/"+this.id+ext;
	}
}

katnip.addModel(Media);

katnip.addAction("getPluginBundles",(bundles)=>{
	bundles.admin.push("katnip-media/components/MediaAdmin.jsx");
});

katnip.addApi("/api/uploadMedia",async ({file},req)=>{
	req.assertCap("manage-content");

	let media=new Media();
	media.id=nodeCrypto.randomUUID();
	media.filename=file.originalFilename;
	media.mimetype=file.mimetype;
	fs.moveSync(file.filepath,media.getStorageFilename());
	await media.save();
});

katnip.addApi("/api/listMedia",async({},req)=>{
	req.assertCap("manage-content");

	return Media.findMany();
});

katnip.addAction("serverMain",async ()=>{
	console.log("Media: "+katnip.getOption("media"));
	fs.mkdirSync(katnip.getOption("media"),{recursive: true});
	fs.accessSync(katnip.getOption("media"));
});