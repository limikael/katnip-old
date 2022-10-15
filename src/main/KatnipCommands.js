export default class KatnipCommands {
	constructor(katnip) {
		this.katnip=katnip;
	}

	initCommandRunner() {
		let commandRunner=this.katnip.commandRunner;

		commandRunner.addCommand("db",{
			shortdesc: "Database maintainance."
		});

		commandRunner.addCommand("db export",this.dbExport,{
			shortdesc: "Export database.",
			level: "postdb",
			args: {
				file: {
					shortdesc: "Name of file where to export."
				}
			}
		});
	}

	dbExport=async ()=>{
		console.log(this.katnip.db);
	}
}