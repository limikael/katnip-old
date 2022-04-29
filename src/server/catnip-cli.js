#!/usr/bin/env node
"use strict";

import "dotenv/config";
import CatnipServer from "./CatnipServer.js";

let options={};

if (process.env.DSN)
	options.dsn=process.env.DSN

let server=new CatnipServer(options);
server.run();
