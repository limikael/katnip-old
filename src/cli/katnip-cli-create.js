import * as readline from 'node:readline';
import fs from "fs";
import child_process from "child_process";

class KatnipScaffolder {
	constructor(options) {
		this.options=options;

		if (options._[1])
			this.projectName=options._[1];

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
				"katnip": "git+https://github.com/limikael/katnip.git"
			},
			"main": "src/"+this.projectName+"-main.js",
			"browser": "src/"+this.projectName+"-browser.jsx",
			"type": "module"
		};

		switch (this.getDb()) {
			case "mysql":
				pkg.dependencies["mysql"]="^2.18.1";
				break;

			case "sqlite3":
				pkg.dependencies["sqlite3"]="^5.1.1";
				break;

			default:
				throw new Error("Unknown db.");
		}

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

	getDb() {
		let urlObject=new URL(this.options.dsn);
		switch (urlObject.protocol) {
			case "mysql:":
				return "mysql";
				break;

			case "sqlite3:":
				return "sqlite3";
				break;

			default:
				throw new Error("Unknown");
				break;
		}
	}

	async run() {
		if (!this.projectName)
			this.projectName=await this.question("Project name: ");

		if (fs.existsSync(this.projectName))
			throw new Error("Folder already exists!");

		if (!this.options.dsn)
			this.options.dsn=await this.question("Data Service Name: ");

		console.log("Creating project "+this.projectName);
		fs.mkdirSync(this.projectName);
		let packageContent=JSON.stringify(this.generatePackageJson(),null,2);
		fs.writeFileSync(this.projectName+"/package.json",packageContent);

		fs.mkdirSync(this.projectName+"/src");
		fs.writeFileSync(this.projectName+"/src/"+this.projectName+"-main.js",'import {katnip} from "katnip"; \n\n// Server stuff');
		fs.writeFileSync(this.projectName+"/src/"+this.projectName+"-browser.jsx",'import {katnip} from "katnip"; \n\n// Client stuff');

		let envContent=
			"DSN="+this.options.dsn;

		fs.writeFileSync(this.projectName+"/.env",envContent);

		let oldDir=process.cwd();
		process.chdir(this.projectName);

		if (!this.options.install)
			this.options.install="npm";

		if (this.options.install!="none") {
			await this.exec(this.options.install,["install"]);
			console.log("Installed! Now run:");
			console.log("");
			console.log("  cd "+this.projectName);
			console.log("  "+this.options.install+" start");
			console.log("");
		}

		process.chdir(oldDir);
	}
}

export async function create(options) {
	let scaffolder=new KatnipScaffolder(options);
	await scaffolder.run();
}

create.args={
	name: {
		shortdesc: "Project name."
	},
	install: {
		shortdesc: "Use npm/yarn/none to install the project."
	},
	dsn: {
		shortdesc: "Data service name."
	}
}

