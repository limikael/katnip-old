import * as readline from 'node:readline';
import fs from "fs";
import child_process from "child_process";

export default class KatnipScaffolder {
	constructor(options) {
		this.options=options;

		if (options._.length>=2)
			this.projectName=options._[1];
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
		return {
			"name": this.projectName,
			"scripts": {
				"start": "katnip start",
				"dev": "katnip dev"
			},
			"dependencies": {
				"katnip": "git+https://github.com/limikael/katnip.git",
				"sqlite3": "^5.1.1"
			},
			"main": "src/"+this.projectName+"-main.js",
			"browser": "src/"+this.projectName+"-browser.jsx",
			"type": "module"
		}
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
			this.projectName=await this.question("Project name? ");

		if (fs.existsSync(this.projectName))
			throw new Error("Folder already exists!");

		console.log("Creating project "+this.projectName);
		fs.mkdirSync(this.projectName);
		let packageContent=JSON.stringify(this.generatePackageJson(),null,2);
		fs.writeFileSync(this.projectName+"/package.json",packageContent);

		fs.mkdirSync(this.projectName+"/src");
		fs.writeFileSync(this.projectName+"/src/"+this.projectName+"-main.js",'import {katnip} from "katnip"; \n\n// Server stuff');
		fs.writeFileSync(this.projectName+"/src/"+this.projectName+"-browser.jsx",'import {katnip} from "katnip"; \n\n// Client stuff');

		let envContent=
			"DSN=sqlite3:"+this.projectName+".db\n"

		fs.writeFileSync(this.projectName+"/.env",envContent);

		let oldDir=process.cwd();
		process.chdir(this.projectName);

		await this.exec("npm",["install"]);
		console.log("Installed! Now run:");
		console.log("");
		console.log("  cd "+this.projectName);
		console.log("  npm run dev");
		console.log("");

		process.chdir(oldDir);
	}
}