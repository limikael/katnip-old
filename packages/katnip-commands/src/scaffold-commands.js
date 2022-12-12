import {katnip} from "katnip";
import fs from "fs";
import path from "path";

function scaffoldDockerCompose(args) {
	let projectDir=katnip.getProjectDir();
	if (fs.existsSync(projectDir+"/docker-compose.yml") && !args.force) {
		console.log("docker-compose.yml already exists, use --force to overwrite.");
		return;
	}

	let srcDir=path.dirname(new URL(import.meta.url).pathname);
	let dockerComposeTemplate=fs.readFileSync(srcDir+"/docker-compose.yml.tpl");

	fs.writeFileSync(projectDir+"/docker-compose.yml",dockerComposeTemplate);
	console.log("Wrote docker-compose.yml");
}

katnip.addCommand("scaffold",{
	desc: "Scaffolding commands."
});

katnip.addCommand("scaffold docker-compose",scaffoldDockerCompose,{
	desc: "Scaffold docker compose file.",
	args: {
		force: {
			desc: "Overwrite existing files.",
			type: "boolean"
		}
	}
});
