var redis   = require("redis-client");
var Message = require("./message");
var Channel = require("./channel");

Publish = module.exports = {};
Publish.listen = function(){
  this.client = redis.createClient();
  this.client.subscribeTo("juggernaut", function(_, data) {
    Channel.publish(Message.fromJSON(data));
  });
};