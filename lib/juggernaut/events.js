var redis   = require("./redis");

Events = module.exports = {};

Events.initEvents = function(redisPort, redisHost) {
  this.initClient(redisPort, redisHost);
};

Events.initClient = function(redisPort, redisHost) {
  this.client = redis.createClient(redisPort, redisHost);
};

Events.publish = function(key, value){
  this.client.publish(
    "juggernaut:" + key, 
    JSON.stringify(value)
  );
};

Events.subscribe = function(channel, client) {
  this.publish(
    "subscribe", 
    {
      channel:    channel.name,
      meta:       client.meta,
      session_id: client.session_id
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