var sys     = require("sys");
var redis   = require("./redis");
var Message = require("./message");
var Channel = require("./channel");

Publish = module.exports = {};
Publish.listen = function(){
  this.client = redis.createClient();
  
  this.client.on("message", function(_, data) {
    sys.log("Received: " + data);
    
    try {
      var message = Message.fromJSON(data);
    } catch(e) { return; }
    
    Channel.publish(message);
  });
  
  this.client.subscribe("juggernaut");
};
