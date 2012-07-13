var util     = require("util");
var redis   = require("./redis");
var Message = require("./message");
var Channel = require("./channel");

Publish = module.exports = {};
Publish.listen = function(redisPort, redisHost){
  this.client = redis.createClient(redisPort, redisHost);
  
  this.client.on("message", function(_, data) {
    util.log("Received: " + data);
    
    try {
      var message = Message.fromJSON(data);
    } catch(e) { return; }
    
    Channel.publish(message);
  });
  
  Channel.initEventsClient(redisPort, redisHost);
  this.client.subscribe("juggernaut");
};
