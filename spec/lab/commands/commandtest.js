import CommandRunner from "../../../src/utils/CommandRunner.js";

let c=new CommandRunner();

c.setGlobalArgs({
	dsn: {
		env: "DSN"
	},
})

function Start() {

}

Start.args={
	port: {
		env: "PORT",
	},
	minify: {
		boolean: true
	}
}

c.addCommand("start",Start);

function Remote() {

}

Remote.stopEarly=true;
Remote.args={
	site: {
		env: "REMOTE_SITE"
	},
	key: {
		env: "REMOTE_KEY"
	}
}

c.addCommand("remote",Remote);

c.run(process.argv.slice(2));