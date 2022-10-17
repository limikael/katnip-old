export default class KatnipCommands {
	constructor(katnip) {
		this.katnip=katnip;
	}

	initCommandRunner() {
		let commandRunner=this.katnip.commandRunner;

		commandRunner.addCommand("setting",{
			desc: "Settings related commands."
		});

		commandRunner.addCommand("setting ls",this.settingLs,{
			output: "table",
			desc: "List settings.",
			level: "postdb",
		});
	}

	settingLs=async ()=>{
		let settings=this.katnip.settingsManager.getSettings();
		let res=[];

		for (let setting of settings) {
			res.push({
				id: setting.id,
				value: JSON.stringify(setting.value)
			});
		}

		return res;
	}
}