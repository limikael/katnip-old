import CommandRunner from "../../../src/utils/CommandRunner.js";

let cr=new CommandRunner("katnip",{
	desc: "Herding cats since 2022.",
	args: {
		test: {desc: "A test argument"},
		watch: {desc: "Should we watch"}
	}
})

cr.addCommand("db",{
	desc: "Database related commands."
});

cr.addCommand("db export",()=>{},{
	desc: "Export database.",
	args: {
		format: {desc: "Export format."}
	}
});

function create(options, name) {
	console.log("creating: "+name);
}

create.desc="Create new project.";
create.args={
	name: {desc: "Project name."}
};
create.optional=["name"];
cr.addCommand("create",create);

cr.addCommand("setting",{
	desc: "Retreives and sets settings."
});

cr.addCommand("setting set",(args, pos)=>{},{
	desc: "Set setting value.",
	args: {
		force: {desc: "Set even if not recognized."}
	},
	required: ["setting name"],
	optional: ["value"]
});

cr.setCommandLine(process.argv.slice(2));
cr.run();