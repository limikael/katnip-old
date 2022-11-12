import fs from "fs";
import child_process from "child_process";

export default class PackageManager {
	constructor(dir) {
		if (!dir)
			dir=process.cwd();

		this.dir=dir;

		if (fs.existsSync(this.dir+"/yarn.lock"))
			this.pm="yarn";

		else
			this.pm="npm";
	}

	exec(cmd, params=[]) {
		return new Promise((resolve, reject)=>{
			let proc=child_process.spawn(cmd,params,{stdio: "inherit"});
			proc.on("exit",(code)=>{
				if (code) {
					reject(new Error("Command failed with code: "+code));
					return;
				}

				resolve();
			});
		});
	}

	installPackage=async (packageName)=>{
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
	}

	uninstallPackage=async (packageName)=>{
		console.log("uninstalling package using "+this.pm);

		switch (this.pm) {
			case "yarn":
				await this.exec("yarn",["remove",packageName]);
				break;

			case "npm":
				await this.exec("npm",["uninstall","--save",packageName]);
				break;

			default:
				throw new Error("Unknown package manager on system.");
				break;
		}
	}
}