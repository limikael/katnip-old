import {arrayEqualsShallow} from "../utils/js-util.js";

export function wrapWords(paragraph, lineLength=10) {
	let words=paragraph.split(/\s+/);
	let lines=[""];
	let n=0;

	for (let word of words) {
		if (lines[n].length+word.length+1>lineLength) {
			lines.push("");
			n++;
		}

		lines[n]+=((lines[n]?" ":"")+word);
	}

	return lines;
}

export function parseSingleNamed(cand) {
	let match=cand.match(/^--([^=]+)(=?)(.*)$/);
	if (match) {
		if (match[1].slice(0,3)=="no-" && match[2]=="" && match[3]=="") {
			match[1]=match[1].slice(3);
			match[3]=false;
		} else

		if (match[2]=="" && match[3]=="") {
			match[3]=true;
		}

		return {
			key: match[1],
			value: match[3]
		}
	}
}

export function parsePositional(cl) {
	let res=[];
	for (let part of cl)
		if (!parseSingleNamed(part))
			res.push(part);

	return res;
}

export function parseNamed(cl) {
	let res={};
	for (let part of cl) {
		let named=parseSingleNamed(part);
		if (named)
			res[named.key]=named.value;
	}

	return res;
}

function formatCols(rows) {
	let l=0;
	for (let row of rows)
		l=Math.max(l,row[0].length)

	for (let row of rows) {
		let splitText=wrapWords(row[1],79-(2+l+2));

		for (let i=0; i<splitText.length; i++) {
			if (!i)
				console.log("  "+row[0]+Array(l-row[0].length).fill(" ").join("")+"  "+splitText[i]);

			else
				console.log("  "+Array(l).fill(" ").join("")+"  "+splitText[i])
		}
	}
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

		if (!this.desc)
			this.desc="";

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
			let name="--"+k;
			if (this.args[k].type!="boolean")
				name+="=...";

			let desc=this.args[k].desc;
			if (!desc)
				desc="No description.";

			if (this.args[k].env)
				desc+=" Can also be set using env variable '"+this.args[k].env+"'.";

			if (this.args[k].default && this.args[k].type=="boolean")
				desc+=" Enabled by default, disable with --no-"+k+".";

			if (this.args[k].default && this.args[k].type!="boolean")
				desc+=" Default: "+this.args[k].default+".";

			rows.push([name,desc]);
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

		if (this.getChildCommands().length ||
				this.commandRunner.notes.length) {
			logHeader("NOTES");

			for (let note of this.commandRunner.notes) {
				console.log("  "+note);
				console.log();
			}

			if (this.getChildCommands().length) {
				let s;
				if (this.isRootCommand())
					s=this.name+" help <command>";

				else
					s=this.getRootCommand().name+" help "+this.name+" <subcommand>";

				console.log("  For more info, use '"+s+"'.");
				console.log();
			}
		}
	}

	getPositionalArguments() {
		return this.commandRunner.getPositionalArguments().slice(this.path.length);
	}

	getNamedArguments() {
		let vals=this.commandRunner.getParsedNamedArguments();

		let args=this.getArgs();

		for (let k in args) {
			if (!vals.hasOwnProperty(k)) {
				if (args[k].default)
					vals[k]=args[k].default;

				if (args[k].env && process.env[args[k].env])
					vals[k]=process.env[args[k].env]
			}

			if (args[k].type=="boolean") {
				if (!vals[k] || vals[k]=="no" || vals[k]=="false")
					vals[k]=false;

				else
					vals[k]=true;
			}
		}

		return vals;
	}

	getArgs() {
		return {...this.args,...this.getRootCommand().args};
	}

	getError() {
		let args=this.getArgs();
		for (let k in this.commandRunner.getParsedNamedArguments())
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
		this.notes=[];
	}

	addNotes(s) {
		this.notes.push(s);
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
		return parsePositional(this.commandLine);
	}

	getParsedNamedArguments() {
		return parseNamed(this.commandLine);
	}

	getNamedArguments() {
		return this.getCommand().getNamedArguments(this.commandLine);
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

		if (this.getParsedNamedArguments().help ||
				!command.callable) {
			if (command.getPositionalArguments().length) {
				console.log("Unknown command: "+this.getPositionalArguments().join(" "));
				console.log("For more info, use '"+this.getRootCommand().name+" help'.");
			}

			else
				command.printHelp();

			//process.exit();
		}

		else if (command.getError()) {
			console.log(this.getCommand().getError());
			console.log("For more info, use '"+this.getRootCommand().name+" help "+command.name+"'.");
			//process.exit();
		}

		else return await command.callable(
			command.getNamedArguments(),
			...command.getPositionalArguments()
		);
	}
}
