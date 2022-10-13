import http from "http";
import net from "net";
import {delay, waitEvent} from "../../src/utils/js-util.js";

let netServer=net.createServer();
netServer.listen(8080);
await waitEvent(netServer,"listening","error");

//let netServer2=net.createServer

console.log(netServer._handle);

let h1=http.createServer((req, res)=>{res.end("hello\n")});
h1.listen(netServer);//._handle);

/*let h2=http.createServer((req, res)=>{res.end("world\n")});
h2.listen(netServer);

h2.close();*/