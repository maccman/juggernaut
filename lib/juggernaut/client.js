var sys = require("sys");
var SuperClass = require("superclass");
var Channel    = require("./channel");
var JUtils     = require("jutils");

Client = module.exports = new SuperClass;

Client.include({
  init: function(conn){
    this.connection = conn;
    this.session_id = this.connection.session_id;
  },
  
  setMeta: function(value){
    this.meta = value;
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
    if (message.except) {
      except = JUtils.makeArray(message.except)
      if (except.indexOf(this.session_id) != -1)
        return false;
    }
    
    this.connection.write(message);
  },
  
  disconnect: function(){
    // Unsubscribe from all channels
    Channel.unsubscribe(this);
  }
});