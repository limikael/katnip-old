#!/usr/bin/env node
"use strict";

import "dotenv/config";
import minimist from "minimist";
import CatnipServer from "./CatnipServer.js";

let options={};
if (process.env.DSN)
	options.dsn=process.env.DSN;

if (process.env.PORT)
	options.port=process.env.PORT;

Object.assign(options,minimist(process.argv.slice(2)));

let server=new CatnipServer(options);
server.run();
