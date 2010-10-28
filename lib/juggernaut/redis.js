var url     = require("url");
var redis   = require("redis-client");

module.exports.createClient = function(){
  if (process.env.REDISTOGO_URL) {
    var address = url.parse(process.env.REDISTOGO_URL);
    return redis.createClient(address.port, address.hostname);
  }
  
  return redis.createClient();
};