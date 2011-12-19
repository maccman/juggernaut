var util     = require("util");
var redis   = require("./redis");
var Message = require("./message");
var Channel = require("./channel");

Publish = module.exports = {};
Publish.listen = function(){
  this.client = redis.createClient();
  
  this.client.on("message", function(_, data) {
    util.log("Received: " + data);
    
    try {
      var message = Message.fromJSON(data);
    } catch(e) { return; }
    
    Channel.publish(message);
  });
  
  this.client.subscribe("juggernaut");
};
