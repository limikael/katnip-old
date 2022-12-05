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
	fs.moveSync(file.filepath,katnip.getOption("media")+"/"+media.id);
	await media.save();
});

katnip.addApi("/api/listMedia",async ({},req)=>{
	req.assertCap("manage-content");

	let medias=await Media.findMany();
	return medias;
});

katnip.addApi("/api/getMedia",async ({id},req)=>{
	req.assertCap("manage-content");

	let media=await Media.findOne(id);
	return media;
});

katnip.addApi("/api/deleteMedia",async ({id},req)=>{
	req.assertCap("manage-content");

	let media=await Media.findOne(id);
	if (fs.existsSync(katnip.getOption("media")+"/"+media.id))
		fs.unlinkSync(katnip.getOption("media")+"/"+media.id);

	await media.delete();
});

katnip.addAction("serverMain",async ()=>{
	console.log("Media: "+katnip.getOption("media"));
	fs.mkdirSync(katnip.getOption("media"),{recursive: true});
	fs.accessSync(katnip.getOption("media"));
});