require("./ext/array");

var Publish = require("./publish");
var Server  = require("./server");

module.exports.listen = function(nodePort, redisPort, redisHost){
  var redisPort = (redisPort || "6379");
  var redisHost = (redisHost || "127.0.0.1");
  
  Publish.listen(redisPort, redisHost);
  var server = Server.inst(redisPort, redisHost);
  server.listen(nodePort);
};