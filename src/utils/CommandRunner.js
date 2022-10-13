import minimist from "minimist";

export default class CommandRunner {
	setGlobalArgs(args) {
		this.globalArgs=args;
		this.commands={};
	}

	addCommand(name, fn, args={}) {
		for (let k in args)
			fn[k]=args[k];

		this.commands[name]=fn;
	}

	run(commandLine) {
		console.log(minimist(commandLine,{
			stopEarly: true,
			boolean: ["minify"]
		}));
	}
}