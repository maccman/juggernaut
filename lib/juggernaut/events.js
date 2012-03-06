var redis   = require("./redis");

Events = module.exports = {};

Events.client = redis.createClient();

Events.publish = function(key, value){
  this.client.publish(
    "juggernaut:" + key, 
    JSON.stringify(value)
  );
};

Events.subscribe = function(channel, client) {
  var handshake = client.connection.stream.manager.handshaken[client.session_id]
  var referer = null;
  if (handshake["headers"]) {
    referer = handshake["headers"]["referer"];
  }
  
  this.publish(
    "subscribe", 
    {
      channel:    channel.name,
      meta:       client.meta,
      session_id: client.session_id,
      referer:  referer
    }
  );
};

Events.unsubscribe = function(channel, client) {
  this.publish(
    "unsubscribe",
    {
      channel:    channel.name,
      meta:       client.meta,
      session_id: client.session_id
    }
  );  
};

Events.custom = function(client, data) {
  this.publish(
    "custom", 
    {
      meta:       client.meta,
      session_id: client.session_id,
      data:       data
    }
  );
};