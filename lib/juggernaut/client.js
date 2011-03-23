var sys     = require("sys");
var Channel = require("./channel");
var Events  = require("./events");

Client = module.exports = require("./klass").create();

Client.include({
  init: function(conn){
    this.connection = conn;
    this.session_id = this.connection.session_id;
  },
  
  setMeta: function(value){
    this.meta = value;
  },
  
  event: function(data){
    Events.custom(this, data);
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
      except = Array.makeArray(message.except);
      if (except.include(this.session_id))
        return false;
    }
    
    this.connection.write(message);
  },
  
  disconnect: function(){
    // Unsubscribe from all channels
    Channel.unsubscribe(this);
  }
});