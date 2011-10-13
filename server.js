#!/usr/bin/env node
var argv = require("optimist").argv,
    path = require("path"),
    util = require("util");

var help = [
    "usage: juggernaut [options] ",
    "",
    "Starts a juggernaut server using the specified command-line options",
    "",
    "options:",
    "  --port   PORT        Port that the proxy server should run on",
    "  --silent             Silence the log output",
    "  -s, --security FILE  File to add security, with a token and a time for the expiration of signatures",
    "  -h, --help           You're staring at it"
].join('\n');

if (argv.h || argv.help) {
  return util.puts(help);
}

var config_path = (argv.s || argv.security) || false;

if (config_path) {
  // Secure mode, let's read the file if it exists
  path.exists(config_path, function (exists) {
    if (!exists) {
      throw new Error('The config file does not exist, so we can\'t be in secure mode. '
                    + 'See the security section in the documentation for more details.');
    }
    
    var custom_config = require(config_path);
    
    // Get the default values
    Config = require("./lib/juggernaut/config");    
    
    // If the sharedToken has not been defined we throw 
    // an error since is required in secure mode
    if (!custom_config.sharedToken) {
      throw new Error('The shared token must be defined. See the security section in '
                    + 'the documentation for more details.');
    }
    
    Config.sharedToken = custom_config.sharedToken; 
    
    if (custom_config.expiration) {
      Config.expiration = custom_config.expiration; 
    }
    
    Config.secure_mode = true;
  });
}

Juggernaut = require("./index");
Juggernaut.listen(argv.port);