import minimist from "minimist";
import {arrayEqualsShallow} from "../utils/js-util.js";

export default class CommandRunner {
	constructor(name) {
		this.commandName=name;
	}

	setGlobalArgs(args) {
		this.globalArgs=args;
		this.commands=[];
	}

	addCommand(name, fn, args={}) {
		for (let k in args)
			fn[k]=args[k];

		fn.callable=fn;
		fn.path=name.split(/\s+/);

		this.commands.push(fn);
	}

	addCommandCategory(name, args) {
		let fn={};

		for (let k in args)
			fn[k]=args[k];

		fn.path=name.split(/\s+/);

		this.commands.push(fn);
	}

	printArgsHelp(argSpecs) {
		let l=0;
		for (let k in argSpecs) {
			let d=k+((!argSpecs[k].boolean)?"=...":"");
			l=Math.max(l,d.length);
		}

		for (let k in argSpecs) {
			let argSpec=argSpecs[k];
			let d=k+((!argSpec.boolean)?"=...":"");
			console.log("   --"+d+Array(l-d.length).fill(" ").join("")+"   "+argSpec.shortdesc)
		}
	}

	printCommandHelp(path) {
		let commands=[];

		for (let c of this.commands)
			if (c.path.length==path.length+1 &&
					arrayEqualsShallow(path,c.path.slice(0,path.length)))
				commands.push(c);

		let l=0;
		for (let command of commands)
			l=Math.max(l,command.path.join(" ").length);

		for (let command of commands) {
			let s=command.path.join(" ");
			console.log("   "+s+"   "+Array(l-s.length).fill(" ").join("")+command.shortdesc);
		}
	}

	usage(e) {
		if (e) {
			console.log(e);
			console.log();
		}

		console.log("Usage: "+this.commandName+" [options] <command> [command options] ...");
		console.log("Commands: ");
		this.printCommandHelp([]);
		console.log("");
		console.log("Options: ");
		this.printArgsHelp(this.globalArgs);
		console.log();
		console.log("For more info, use '"+this.commandName+" help' or '"+this.commandName+" help <command>'.")
		process.exit(1);
	}

	getBooleanArgNames(argSpec) {
		let boolean=[];

		for (let k in argSpec)
			if (argSpec[k].boolean)
				boolean.push(k);

		return boolean;
	}

	getArgError(spec, cand) {
		for (let k in cand)
			if (k!="_" && !spec[k])
				return "Unknown option: "+k;
	}

	getCommandByPath(path) {
		let command;
		let specificity=0;

		for (let c of this.commands)
			if (arrayEqualsShallow(c.path,path.slice(0,c.path.length)) &&
					c.path.length>specificity) {
				command=c;
				specificity=c.path.length;
			}

		return command;
	}

	run(commandLine) {
		let params=minimist(commandLine,{
			stopEarly: true,
			boolean: this.getBooleanArgNames(this.globalArgs)
		});

		if (!params._.length)
			this.usage();

		let e=this.getArgError(this.globalArgs,params)
		if (e)
			this.usage(e);

		console.log(params._);

		let command=this.getCommandByPath(params._);
		if (!command || !command.callable)
			this.usage("Unknown command: "+params._.join(" "));

		let commandParams=minimist(params._.slice(command.path.length),{
			stopEarly: command.stopEarly,
			boolean: this.getBooleanArgNames(command.args)
		});

		e=this.getArgError(command.args,commandParams)
		if (e)
			this.usage(e);

		command.callable(commandParams);
	}
}