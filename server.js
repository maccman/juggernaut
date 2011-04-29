#!/usr/bin/env node
var argv = require("optimist").argv,
    util = require("util");

var help = [
    "usage: juggernaut [options] ",
    "",
    "Starts a juggernaut server using the specified command-line options",
    "",
    "options:",
    "  --port   PORT       Port that the proxy server should run on",
    "  --silent            Silence the log output",
    "  -h, --help          You're staring at it"
].join('\n');

if (argv.h || argv.help) {
  return util.puts(help);
}

Juggernaut = require("./index");
Juggernaut.listen(argv.port);