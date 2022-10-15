import fs from "fs";
import child_process from "child_process";

export default class PackageManager {
	constructor(dir) {
		if (!dir)
			dir=process.cwd();

		this.dir=dir;

		console.log(this.dir);
		if (fs.existsSync(this.dir+"/yarn.lock"))
			this.pm="yarn";

		else
			this.pm="npm";
	}

	exec(cmd, params=[]) {
		return new Promise((resolve, reject)=>{
			let proc=child_process.spawn(cmd,params,{stdio: "inherit"});
			proc.on("exit",(code)=>{
				if (code)
					reject("Command failed with code: "+code);

				resolve();
			});
		});
	}

	async installPackage(packageName) {
		console.log("installing package using "+this.pm);

		switch (this.pm) {
			case "yarn":
				await this.exec("yarn",["add",packageName]);
				break;

			case "npm":
				await this.exec("npm",["install","--save",packageName]);
				break;

			default:
				throw new Error("Unknown package manager on system.");
				break;
		}

		console.log("Linking module alias...");
		await this.exec("node_modules/.bin/link-module-alias");
	}

	async verifyPackage(packageName) {
		await this.installPackage(packageName);
	}
}