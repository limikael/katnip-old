#!/usr/bin/env node

import PluginLoader from "../../src/utils/PluginLoader.js";

let loader=new PluginLoader();
loader.addPluginSpecifier("plugins");
loader.addPluginPath("node_modules/katnip/default_plugins");
loader.addPlugin("node_modules/katnip");
loader.addPlugin(".");
loader.addPlugin(".");

await loader.loadPlugins();
