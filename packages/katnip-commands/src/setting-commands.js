import {katnip} from "katnip";

async function settingLs() {
	let settings=katnip.getSettings();
	let res=[];

	for (let setting of settings) {
		res.push({
			id: setting.id,
			value: JSON.stringify(setting.value)
		});
	}

	return res;
}

katnip.addCommand("setting",{
	desc: "Settings related commands."
});

katnip.addCommand("setting ls",settingLs,{
	output: "table",
	desc: "List settings.",
	level: "postdb",
});
