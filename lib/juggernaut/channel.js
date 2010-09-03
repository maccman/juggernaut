var sys = require("sys"), 
    utils = require("utils");

var SuperClass = require("superclass");
Channel = module.exports = new SuperClass;

Channel.extend({
  channels: {},
  
  find: function(name){
    if ( !this.channels[name] ) 
      this.channels[name] = new Channel(name)
    return this.channels[name];
  },
  
  publish: function(message){
    var channels = message.getChannels();
    delete message.channels;
    
    sys.log(
      "Publishing to channels: " + 
      utils.inspect(channels) + " : " + message.data
    );
    
    for(var i=0, len = channels.length; i < len; i++) {
      message.channel = channels[i];
      var clients     = this.find(channels[i]).clients;

      for(var x=0, len = clients.length; x < len; x++)
        clients[x].write(message);
    }
  },
  
  unsubscribe: function(client){
    for (var name in this.channels)
      this.channels[name].unsubscribe(client);
  }
});

Channel.include({
  init: function(name){
    this.name    = name;
    this.clients = [];
  },
  
  subscribe: function(client){
    this.clients.push(client);
  },
  
  unsubscribe: function(client){
    this.clients.delete(client)
  }
});