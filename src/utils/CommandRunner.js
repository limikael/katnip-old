import minimist from "minimist";
import {arrayEqualsShallow} from "../utils/js-util.js";

export function parseNamed(cand) {
	let match=cand.match(/^--([^=]+)(=?)(.*)$/);
	if (match) {
		/*if (match[1].slice(0,3)=="no-" && match[2]=="" && match[3]=="") {
			match[1]=match[1].slice(3);
			match[3]=false;
		} else*/

		if (match[2]=="" && match[3]=="") {
			match[3]=true;
		}

		return {
			key: match[1],
			value: match[3]
		}
	}
}

export function getPositionalArguments(cl) {
	let res=[];
	for (let part of cl)
		if (!parseNamed(part))
			res.push(part);

	return res;
}

export function getNamedArguments(cl) {
	let res={};
	for (let part of cl) {
		let named=parseNamed(part);
		if (named)
			res[named.key]=named.value;
	}

	return res;
}

function formatCols(rows) {
	let l=0;
	for (let row of rows)
		l=Math.max(l,row[0].length)

	for (let row of rows)
		console.log("  "+row[0]+Array(l-row[0].length).fill(" ").join("")+"  "+row[1]);
}

function logHeader(s) {
	console.log("\x1b[1m"+s+"\x1b[22m");
}

class Command {
	constructor(name, callable, command={}) {
		command={...command,...callable};
		for (let k in command)
			this[k]=command[k];

		this.name=name;

		if (typeof callable=="function")
			this.callable=callable;

		if (!this.path)
			this.path=this.name.split(/\s+/);

		if (!this.args)
			this.args={};

		if (!this.required)
			this.required=[];

		if (!this.optional)
			this.optional=[];
	}

	printArgsHelp() {
		if (!Object.keys(this.args).length)
			return;

		if (this.isRootCommand())
			logHeader("GLOBAL OPTIONS");

		else
			logHeader("COMMAND OPTIONS");

		let rows=[];
		for (let k in this.args) {
			if (this.args[k].type=="boolean")
				rows.push(["--"+k,this.args[k].desc]);

			else
				rows.push(["--"+k+"=...",this.args[k].desc]);

			if (this.args[k].env)
				rows.push(["","Can also be set using env variable '"+this.args[k].env+"'."]);
		}

		formatCols(rows);
		console.log();
	}

	getChildCommands() {
		return this.commandRunner.getChildCommandsByPath(this.path);
	}

	printChildCommands() {
		if (!this.getChildCommands().length)
			return;

		logHeader(this.getChildCommandLabel().toUpperCase()+"S");

		let rows=[];
		for (let c of this.getChildCommands())
			rows.push([c.path.slice(-1)[0],c.desc]);

		formatCols(rows);
		console.log();
	}

	isRootCommand() {
		return (this==this.getRootCommand())
	}

	getRootCommand() {
		return this.commandRunner.getRootCommand();
	}

	getLongName() {
		if (this.isRootCommand())
			return this.name

		return this.getRootCommand().name+" "+this.name;
	}

	getChildCommandLabel() {
		if (this.isRootCommand())
			return "command";

		else
			return "subcommand";
	}

	getUsage() {
		let s=this.getLongName()+" [options]";

		if (this.getChildCommands().length)
			s+=" <"+this.getChildCommandLabel()+">";

		s+=this.required.map((s)=>" <"+s+">").join();
		s+=this.optional.map((s)=>" ["+s+"]").join();

		return s;
	}

	printHelp() {
		logHeader("NAME");
		console.log("  "+this.getLongName()+" - "+this.desc);
		console.log();
		logHeader("USAGE");
		console.log("  "+this.getUsage());
		console.log();

		this.printChildCommands();
		this.printArgsHelp();

		if (!this.isRootCommand() && !this.getChildCommands().length)
			this.getRootCommand().printArgsHelp();

		if (this.getChildCommands().length) {
			logHeader("NOTES");

			let s;
			if (this.isRootCommand())
				s=this.name+" help <command>";

			else
				s=this.getRootCommand().name+" help "+this.name+" <subcommand>";

			console.log("  For more info, use '"+s+"'.");
			console.log();
		}
	}

	getPositionalArguments() {
		return this.commandRunner.getPositionalArguments().slice(this.path.length);
	}

	getNamedArguments() {
		let vals=this.commandRunner.getNamedArguments();

		let args=this.getArgs();
		for (let k in args)
			if (args[k].env && process.env[args[k].env] && !vals[k])
				vals[k]=process.env[args[k].env]

		return vals;
	}

	getArgs() {
		return {...this.args,...this.getRootCommand().args};
	}

	getError() {
		let args=this.getArgs();
		for (let k in this.commandRunner.getNamedArguments())
			if (!args[k])
				return "Unrecognized option: "+k;

		let minAccept=this.required.length;
		let maxAccept=this.required.length+this.optional.length;
		let n=this.getPositionalArguments().length;

		if (n<minAccept)
			return "Too few arguments.";

		if (n>maxAccept)
			return "Too many arguments.";
	}
}

export default class CommandRunner {
	constructor(name, command={}) {
		this.commands=[];
		this.addCommand(name,{...command, path:[]});
	}

	getRootCommand() {
		return this.commands[0];
	}

	setCommandLine(commandLine) {
		if (commandLine[0]=="help")
			commandLine[0]="--help";

		this.commandLine=commandLine;
	}

	addCommand(name, callable, command) {
		let c=new Command(name,callable,command);
		c.commandRunner=this;

		this.commands.push(c);
	}

	getCommandByPathMatch(path) {
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

	getPositionalArguments() {
		return getPositionalArguments(this.commandLine);
	}

	getNamedArguments() {
		return getNamedArguments(this.commandLine);
	}

	getCommand() {
		return this.getCommandByPathMatch(this.getPositionalArguments());
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

	haveRunnableCommand() {
		return !!this.getCommand().callable;
	}

	async run() {
		let command=this.getCommand();

		if (this.getNamedArguments().help ||
				!command.callable) {
			if (command.getPositionalArguments().length) {
				console.log("Unknown command: "+this.getPositionalArguments().join(" "));
				console.log("For more info, use '"+this.getRootCommand().name+" help'.");
			}

			else
				command.printHelp();

			process.exit();
		}

		if (command.getError()) {
			console.log(this.getCommand().getError());
			console.log("For more info, use '"+this.getRootCommand().name+" help "+command.name+"'.");
			process.exit();
		}

		return await command.callable(
			command.getNamedArguments(),
			...command.getPositionalArguments()
		);
	}
}