import CommandRunner, {wrapWords} from "../../src/utils/CommandRunner.js";

describe("CommandRunner",()=>{
	it("works",async ()=>{
		let c=new CommandRunner("testing",{
			desc: "the testing command",
			args: {
				hello: {desc: "the hello param"}
			}
		});
		c.addCommand("bla",()=>{},{
			desc: "the test command",
			args: {
				world: {desc: "world", env: "TEST"},
				bool: {desc: "a bool with a long description and stuff. another sentence as xyz well goes here.", default: true, type: "boolean"},
				port: {default: 3000}
			}
		});

		process.env["TEST"]="testing";
		//console.log(process.env);

		c.setCommandLine(["bla","--hello=5","--help"]);
		expect(c.getNamedArguments().hello).toEqual('5');

		expect(c.getNamedArguments().world).toEqual('testing');
		expect(c.getNamedArguments().bool).toEqual(true);

		expect(c.getPositionalArguments()).toEqual(["bla"]);

		c.setCommandLine(["bla","--hello=5","--help","--bool=false"]);
		expect(c.getNamedArguments().bool).toEqual(false);

		c.setCommandLine(["bla","--hello=5","--help","--no-bool"]);
		expect(c.getNamedArguments().bool).toEqual(false);

		//c.run();
	});

	it("splits lines",()=>{
		expect(wrapWords("hello world a long sentence and stuff",13).length).toEqual(3);
	});
});