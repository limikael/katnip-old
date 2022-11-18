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

		return this.id+ext;
	}

	getStorageFilepath() {
		return katnip.getOption("media")+"/"+this.getStorageFilename();
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
	fs.moveSync(file.filepath,media.getStorageFilepath());
	await media.save();
});

katnip.addApi("/api/listMedia",async ({},req)=>{
	req.assertCap("manage-content");

	let medias=await Media.findMany();
	for (let media of medias)
		media.url="/"+media.getStorageFilename();

	return medias;
});

katnip.addApi("/api/getMedia",async ({id},req)=>{
	req.assertCap("manage-content");

	let media=await Media.findOne(id);
	media.url="/"+media.getStorageFilename();

	return media;
});

katnip.addApi("/api/deleteMedia",async ({id},req)=>{
	req.assertCap("manage-content");

	let media=await Media.findOne(id);
	fs.unlinkSync(media.getStorageFilepath());
	await media.delete();
});

katnip.addAction("serverMain",async ()=>{
	console.log("Media: "+katnip.getOption("media"));
	fs.mkdirSync(katnip.getOption("media"),{recursive: true});
	fs.accessSync(katnip.getOption("media"));
});