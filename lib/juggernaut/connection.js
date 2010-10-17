var sys = require("sys");
var SuperClass = require("superclass");
var Client     = require("./client");
Connection     = module.exports = new SuperClass;

Connection.include({
  init: function(stream){
    this.stream     = stream;
    this.session_id = this.stream.sessionId;
    this.client     = new Client(this);

    this.stream.on("message", this.proxy(this.onmessage));
    this.stream.on("disconnect", this.proxy(this.ondisconnect));
  },
  
  onmessage: function(data){
    sys.log("Received: " + data);
    
    try {
      var message = Message.fromJSON(data);
    } catch(e) { return; }
    
    switch (message.type){
      case "subscribe":
        this.client.subscribe(message.getChannel());
      break;
      case "unsubscribe":
        this.client.unsubscribe(message.getChannel());
      break;
      case "meta":
        this.client.setMeta(message.data);
      break;
      case "event":
        this.client.event(message.data);
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