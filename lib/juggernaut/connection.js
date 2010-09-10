var sys = require("sys");
var SuperClass = require("superclass");
var Client     = require("./client");
Connection     = module.exports = new SuperClass;

Connection.include({
  init: function(stream){
    this.stream    = stream;
    this.sessionID = this.stream.sessionId;
    this.client    = new Client(this);

    this.stream.on("message", this.proxy(this.onmessage));
    this.stream.on("disconnect", this.proxy(this.ondisconnect));
  },
  
  onmessage: function(data){
    sys.log("Received: " + data);
    
    var message = Message.fromJSON(data);
    
    switch (message.type){
      case "subscribe":
        this.client.subscribe(message.getChannels());
      break;
      case "unsubscribe":
        this.client.unsubscribe(message.getChannels());
      break;
      default:
        throw "Unknown type"
    }
  },
  
  ondisconnect: function(){
    this.client.disconnect();
  },
  
  write: function(message){
    if (typeof message.toJSON == "function")
      message = message.toJSON();
    this.stream.send(message);
  }
});