import fs from "fs";

export function getKatnipDir(dir) {
	if (!dir)
		dir=process.cwd();

	if (fs.existsSync(dir+"/node_modules/katnip"))
		return dir;
}
