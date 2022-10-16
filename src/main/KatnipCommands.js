export default class KatnipCommands {
	constructor(katnip) {
		this.katnip=katnip;
	}

	initCommandRunner() {
		let commandRunner=this.katnip.commandRunner;

		commandRunner.addCommand("db",{
			desc: "Database maintainance."
		});

		commandRunner.addCommand("db export",this.dbExport,{
			desc: "Export database.",
			level: "postdb",
			args: {
				file: {
					desc: "Name of file where to export."
				}
			}
		});
	}

	dbExport=async ()=>{
	}
}