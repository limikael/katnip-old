import * as readline from 'node:readline';
import fs from "fs";
import child_process from "child_process";

class KatnipScaffolder {
	constructor(options) {
		this.options=options;
		if (options.name)
			this.projectName=options.name;
	}

	question(prompt) {
		return new Promise((resolve)=>{
			let rl=readline.createInterface({input: process.stdin,output: process.stdout});
			rl.question(prompt,(answer)=>{
				rl.close();
				resolve(answer);
			});
		})
	}	

	generatePackageJson() {
		let pkg={
			"name": this.projectName,
			"scripts": {
				"start": "katnip start",
			},
			"dependencies": {
//				"katnip": "git+https://github.com/limikael/katnip.git"
				"katnip": "file:///home/micke/Repo/katnip"
			},
			"main": "src/"+this.projectName+"-main.js",
			"browser": "src/"+this.projectName+"-browser.jsx",
			"type": "module"
		};

		return pkg;
	}

	exec(cmd,params=[]) {
		return new Promise((resolve, reject)=>{
			let proc=child_process.spawn(cmd,params,{stdio: "inherit"});
			proc.on("exit",(code)=>{
				if (code)
					reject("Command failed with code: "+code);

				resolve();
			});
		});
	}

	async run() {
		if (!this.projectName)
			this.projectName=await this.question("Project name: ");

		if (fs.existsSync(this.projectName))
			throw new Error("Folder already exists!");

		console.log("Creating project "+this.projectName);
		fs.mkdirSync(this.projectName);
		let packageContent=JSON.stringify(this.generatePackageJson(),null,2);
		fs.writeFileSync(this.projectName+"/package.json",packageContent);

		fs.mkdirSync(this.projectName+"/src");
		fs.writeFileSync(this.projectName+"/src/"+this.projectName+"-main.js",'import {katnip} from "katnip"; \n\n// Server stuff');
		fs.writeFileSync(this.projectName+"/src/"+this.projectName+"-browser.jsx",'import {katnip} from "katnip"; \n\n// Client stuff');

		if (!this.options.install)
			this.options.install="npm";

		if (this.options.install!="none") {
			let oldDir=process.cwd();
			process.chdir(this.projectName);

			await this.exec(this.options.install,["install"]);
			console.log("Installed! Entering interactive setup...");

			process.chdir(oldDir);
		}
	}
}

export async function create(options, name) {
	if (name)
		options.name=name;

	let scaffolder=new KatnipScaffolder(options);
	await scaffolder.run();
}

create.desc="Create a new katnip project.";
create.args={
	name: {desc: "Project name."},
	install: {desc: "Use npm/yarn/none to install the project."},
}

