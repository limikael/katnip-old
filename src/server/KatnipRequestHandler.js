import {quoteAttr, delay, buildUrl} from "../utils/js-util.js";
import fs from "fs";
import crypto from "crypto";
import KatnipRequest from "../lib/KatnipRequest.js";

export default class KatnipRequestHandler {
	constructor(katnip, options) {
		this.katnip=katnip;
		this.options=options;
		this.startTime=Date.now();
	}

	setBundleHash(bundleHash) {
		this.bundleHash=bundleHash;
	}

	handleDefault=async (req, res)=>{
		let initChannelIds=[];
		await this.katnip.doActionAsync("initChannels",initChannelIds,req);
		for (let channel of this.katnip.getSettings({session: true}))
			initChannelIds.push(channel.id);

		let initChannels={};
		for (let channelId of initChannelIds)
			initChannels[channelId]=await this.katnip.getChannelData(channelId,req);

		//console.log(JSON.stringify(initChannels));

		let quotedChannels=quoteAttr(JSON.stringify(initChannels));

		res.writeHead(200,{
			"Set-Cookie": `katnip=${req.sessionId}`
		});

		let bundleUrl=buildUrl("/katnip-bundle.js",{
			hash: this.bundleHash
		});

		let clientPage=`<body><html>`;
		clientPage+=`<head>`;
		clientPage+=`<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">`;
		clientPage+=`</head>`;
		clientPage+=`<div id="katnip-root"></div>`;
		clientPage+=`<script data-channels="${quotedChannels}" src="${bundleUrl}"></script>`;
		clientPage+=`</html></body>`;

		res.end(clientPage);
	}

	handleRequest=async (req, res)=>{
		try {
			await this.handleDefault(req,res);
		}

		catch (e) {
			console.log(e);
			res.writeHead(500);
			res.end("");
		}
	}	
}