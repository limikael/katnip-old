import fs from "fs";
import crypto from "crypto";

export default class ContentMiddleware {
	constructor() {
		this.paths=[];
		this.content={};
		this.startTime=Date.now();
	}

	addPath(path) {
		this.paths.push(path);
	}

	addContent(fn, content) {
		let hash=this.hash(content);

		this.content[fn]={content,hash};

		return hash;
	}

	hash(content) {
		return crypto
			.createHash('sha1')
			.update(content, 'utf8')
			.digest('hex');
	}

	getFileHash(fn) {
		return this.hash(fs.readFileSync(fn));
	}

	getContentFileHashes(dir) {
		let res=[];

		for (let dirContent of fs.readdirSync(dir)) {
			let cand=dir+"/"+dirContent;
			if (fs.lstatSync(cand).isDirectory())
				res.push(...this.getContentFileHashes(cand))

			else
				res.push(this.getFileHash(cand))
		}

		return res;
	}

	computeContentHash() {
		let allHashes=[];

		for (let path of this.paths)
			if (fs.existsSync(path))
				allHashes.push(...this.getContentFileHashes(path));

		let hash=crypto
			.createHash('sha1')
			.update(allHashes.join(), 'utf8')
			.digest('hex');

		return hash;
	}

	getContentHash() {
		if (!this.contentHash)
			this.contentHash=this.computeContentHash();

		return this.contentHash;
	}

	computeETag=(entity)=>{
		let hash = crypto
			.createHash('sha1')
			.update(entity, 'utf8')
			.digest('base64')
			.substring(0, 27)

		let len = typeof entity==='string'
			?Buffer.byteLength(entity,'utf8')
			:entity.length

		return '"' + len.toString(16) + '-' + hash + '"';
	}

	handleContent=(req, res, content, headers)=>{
		headers["ETag"]=this.computeETag(content);

		let len=typeof content==='string'
			?Buffer.byteLength(content,'utf8')
			:content.length

		headers["Content-Length"]=len;

		if (!headers["Cache-Control"])
			headers["Cache-Control"]="public, max-age=0";

		if (req.headers["if-none-match"]==headers["ETag"]) {
			res.writeHead(304,headers);
			res.end();
			return;
		}

		res.writeHead(200,headers);
		res.end(content);
	}

	getFileMimeType(fn) {
		let ext=fn.split('.').pop().toLowerCase();
		let types={
			"jpg": "image/jpeg",
			"jpeg": "image/jpeg",
			"png": "image/png",
			"js": "application/javascript",
			"mjs": "application/javascript",
			"css": "text/css"
		};

		if (types[ext])
			return types[ext];

		return "application/octet-stream";
	}

	handleRequest=async (req, res, next)=>{
		for (let path of this.paths) {
			let cand=path+"/"+req.pathname;

			if (fs.existsSync(cand) && fs.lstatSync(cand).isFile()) {
				let mtime=fs.statSync(cand).mtime;
				let headers={
					"Content-Type": this.getFileMimeType(cand),
					"Last-Modified": new Date(mtime).toUTCString()
				};

				if (req.query.contentHash &&
						req.query.contentHash==this.contentHash)
					headers["Cache-Control"]="public, max-age=31536000";

				if (this.preserve) {
					try {
						await this.preserve(req,headers);
					}

					catch (e) {
						console.log(e);
						res.writeHead(500);
						res.end(e.message);
						return;
					}
				}

				this.handleContent(req,res,fs.readFileSync(cand),headers);
				return;
			}
		}

		for (let fn in this.content) {
			if (req.pathname==fn) {
				//console.log("content: "+fn);

				let headers={
					"Content-Type": this.getFileMimeType(fn),
					"Last-Modified": new Date(this.startTime).toUTCString()
				};

				if (req.query.hash &&
						req.query.hash==this.content[fn].hash)
					headers["Cache-Control"]="public, max-age=31536000";

				this.handleContent(req,res,this.content[fn].content,headers);
				return;
			}
		}

		next();
	}
}