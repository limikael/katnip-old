import http from "http";
import {delay} from "../../src/utils/js-util.js";
import WebProcessChild from "../../src/cli/WebProcessChild.js";

let child=new WebProcessChild();

console.log("child init...");

await delay(5000);

let server=http.createServer((req,res)=>{
	res.end("hello from the child\n");
});

let parentServer=await child.initialized();
server.listen(parentServer);
server.once("listening",()=>{
	child.notifyListening();
});
