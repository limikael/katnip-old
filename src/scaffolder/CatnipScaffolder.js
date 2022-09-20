import * as readline from 'node:readline/promises';
import fs from "fs";
import child_process from "child_process";

export default class CatnipScaffolder {
	constructor(options) {
		this.options=options;

		if (options._.length>=2)
			this.projectName=options._[1];
	}

	async question(prompt) {
		let rl=readline.createInterface({input: process.stdin,output: process.stdout});
		let answer=await rl.question(prompt);
		rl.close();

		return answer;
	}	

	generatePackageJson() {
		return {
			"name": this.projectName,
			"scripts": {
				"start": "catnip start",
				"dev": "catnip dev"
			},
			"dependencies": {
				"catnip": "git+https://github.com/limikael/catnip.git",
				"sqlite3": "^5.1.1"
			}
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