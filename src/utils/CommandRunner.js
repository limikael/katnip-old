import minimist from "minimist";
import {arrayEqualsShallow} from "../utils/js-util.js";

class Command {
	constructor(name, fn, command={}) {
		if (fn)
			for (let k in fn)
				command[k]=fn[k];

		if (!command.args)
			command.args={};

		command.name=name;
		command.callable=fn;
		command.path=command.name.split(/\s+/);

		for (let k in command)
			this[k]=command[k];

		if (!this.args)
			this.args={};
	}

	getBooleanArgNames() {
		let boolean=[];

		for (let k in this.args)
			if (this.args[k].boolean)
				boolean.push(k);

		return boolean;
	}

	getArgError(cand) {
		for (let k in cand)
			if (k!="_" && !this.args[k])
				return "Unknown option: "+k;
	}

	populateEnvParams(params) {
		for (let k in this.args)
			if (this.args[k].env && !params[k])
				params[k]=process.env[this.args[k].env];
	}

	failOnError(params) {
		let e=this.getArgError(params);
		if (e) {
			console.log(e);
			process.exit(1);
		}
	}

	getDefault(params) {
		let def={};

		for (let k in this.args)
			if (this.args[k].negativedesc)
				def[k]=true;

		return def;
	}
}

export default class CommandRunner {
	constructor(name, command={}) {
		this.commands=[];

		this.addCommandCategory(name, command)
		this.commands[0].path=[];

		this.commandLine=process.argv.slice(2);
		//console.log(this.commandLine);
	}

	addCommandCategory(name, command={}) {
		this.addCommand(name,null,command)
	}

	addCommand(name, fn, command={}) {
		if (typeof fn!="function") {
			command={...command,...fn};
			fn=null;
		}

		this.commands.push(new Command(name,fn,command));
	}

	printArgsHelp(command) {
		let argRows=[];

		for (let k in command.args) {
			if (command.args[k].negativedesc)
				argRows.push(["--no-"+k,command.args[k].negativedesc]);

			else if (command.args[k].boolean)
				argRows.push(["--"+k,command.args[k].shortdesc]);

			else
				argRows.push(["--"+k+"=...",command.args[k].shortdesc]);

			if (command.args[k].env)
				argRows.push(["","Can also use env variable "+command.args[k].env+"."]);
		}

		if (argRows.length) {
			if (command.path.length)
				console.log("Command Options:");

			else
				console.log("Global Options:");

			this.fmtCols(argRows);
			console.log("");
		}
	}

	printCommandHelp(command) {
		let u="Usage: "+this.commands[0].name;

		if (command.path.length) {
			u+=" [global options]"
			u+=" "+command.path.join(" ");
			if (!command.callable)
				u+=" <sub command>";

			if (Object.keys(command.args).length)
				u+=" [command options]"
		}

		else {
			u+=" [global options] <command> [command options]";
		}

		console.log(u);

		if (command.path.length) {
			console.log();
			console.log(command.shortdesc);
			console.log();
		}

		let commandRows=[];
		for (let c of this.getChildCommandsByPath(command.path))
			commandRows.push([c.name,c.shortdesc]);

		if (commandRows.length) {
			if (command.path.length)
				console.log("Sub Commands:");

			else
				console.log("Commands:");

			this.fmtCols(commandRows);
			console.log();
		}

		this.printArgsHelp(command);

		if (!command.callable)
			if (command.path.length)
				console.log("For more info, use '"+this.commands[0].name+" help "+command.path.join(" ")+" <sub command>'.")

			else
				console.log("For more info, use '"+this.commands[0].name+" help <command>'.")
	}

	getCommandByPath(path) {
		let command;
		let specificity=-1;

		for (let c of this.commands)
			if (arrayEqualsShallow(c.path,path.slice(0,c.path.length)) &&
					c.path.length>specificity) {
				command=c;
				specificity=c.path.length;
			}

		return command;
	}

	getChildCommandsByPath(path) {
		let childCommands=[];
		for (let c of this.commands)
			if (c.path.length==path.length+1 &&
					arrayEqualsShallow(path,c.path.slice(0,path.length)) &&
					!c.undoc)
				childCommands.push(c);

		return childCommands;
	}

	fmtCols(rows) {
		let l=0;
		for (let row of rows)
			l=Math.max(l,row[0].length)

		for (let row of rows)
			console.log("   "+row[0]+Array(l-row[0].length).fill(" ").join("")+"   "+row[1]);
	}

	getGlobalParams() {
		let params=minimist(this.commandLine,{
			stopEarly: true,
			boolean: this.commands[0].getBooleanArgNames(),
			default: this.commands[0].getDefault()
		});

		this.commands[0].populateEnvParams(params);
		this.commands[0].failOnError(params);

		if (params._[0]=="help") {
			params._=params._.slice(1);
			params.help=true;
		}

		return params;
	}

	getCommand() {
		return this.getCommandByPath(this.getGlobalParams()._);
	}

	getCommandParams() {
		let command=this.getCommand();
		let params=minimist(this.getGlobalParams()._.slice(command.path.length),{
			stopEarly: command.stopEarly,
			boolean: command.getBooleanArgNames(),
			default: command.getDefault()
		});

		command.populateEnvParams(params);
		command.failOnError(params);

		return params;
	}

	haveCommand() {
		return !!this.getCommand().callable;
	}

	async run() {
		let globalParams=this.getGlobalParams();
		let command=this.getCommand();
		let commandParams=this.getCommandParams();

		if (globalParams.help || !command.callable) {
			this.printCommandHelp(command);
			process.exit();
		}

		return await command.callable({...globalParams,...commandParams});
	}
}