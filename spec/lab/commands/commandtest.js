import CommandRunner from "../../../src/utils/CommandRunner.js";

let c=new CommandRunner("katnip");

c.setGlobalArgs({
	dsn: {
		env: "DSN",
		shortdesc: "Specify data service name."
	},
	debug: {
		boolean: true,
		shortdesc: "Enable debug."
	}
})

function start(args) {
	console.log("starting");
	console.log(args);
}

start.args={
	port: {
		env: "PORT",
	},
	minify: {
		boolean: true
	}
}

c.addCommand("start",start,{
	shortdesc: "Start server."
});

function Remote(args) {
	console.log("remote");
	console.log(args);
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

c.addCommand("remote",Remote,{
	shortdesc: "Run command on remote sever."
});

function DbExport(args) {
	console.log("db export");
	console.log(args);
}

DbExport.args={
	format: {
		shortdesc: "The format used to save the exported data."
	}
}

c.addCommand("db export",DbExport,{
	shortdesc: "Export database."
});

function DbImport(args) {
	console.log("db import");
	console.log(args);
}

DbImport.args={
	format: {
	}
}

c.addCommand("db import",DbImport,{
	shortdesc: "Import database."
});

c.addCommandCategory("db",{
	shortdesc: "Database related commands."
});

c.run(process.argv.slice(2));