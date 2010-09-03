var sys = require("sys");
var SuperClass = require("superclass");
var Channel    = require("./channel");

Client = module.exports = new SuperClass;

Client.include({
  init: function(conn){
    this.connection = conn;
  },
  
  subscribe: function(name){
    sys.log("Client subscribing to: " + name);
    
    var channel = Channel.find(name)
    channel.subscribe(this);
  },
  
  unsubscribe: function(name){
    sys.log("Client unsubscribing from: " + name);

    var channel = Channel.find(name);
    channel.unsubscribe(this);
  },
    
  write: function(message){
    this.connection.write(message);
  },
  
  disconnect: function(){
    // Unsubscribe from all channels
    Channel.unsubscribe();
  }
});