// For sprockets:
//
//= require <json>
//= require <socket_io>

var Juggernaut = function(options){
  this.options = options || {};
  
  this.options.host = this.options.host || window.location.hostname;
  this.options.port = this.options.port || 8080;
  
  this.handlers = {};
  this.meta     = this.options.meta;

  this.io = io.connect(this.options.host, this.options);

  this.io.on("connect",    this.proxy(this.onconnect));
  this.io.on("message",    this.proxy(this.onmessage));
  this.io.on("disconnect", this.proxy(this.ondisconnect));

  this.on("connect", this.proxy(this.writeMeta));
};

// Helper methods

Juggernaut.fn = Juggernaut.prototype;
Juggernaut.fn.proxy = function(func){
  var thisObject = this;
  return(function(){ return func.apply(thisObject, arguments); });
};

// Public methods

Juggernaut.fn.on = function(name, callback){
  if ( !name || !callback ) return;
  if ( !this.handlers[name] ) this.handlers[name] = [];
  this.handlers[name].push(callback);
};
Juggernaut.fn.bind = Juggernaut.fn.on;

Juggernaut.fn.unbind = function(name){
  if (!this.handlers) return;
  delete this.handlers[name];
};

Juggernaut.fn.write = function(message){
  if (typeof message.toJSON == "function")
    message = message.toJSON();

  this.io.send(message);
};

Juggernaut.fn.subscribe = function(channel, callback){
  if ( !channel ) throw "Must provide a channel";

  this.on(channel + ":data", callback);

  var connectCallback = this.proxy(function(){
    var message     = new Juggernaut.Message;
    message.type    = "subscribe";
    message.channel = channel;

    this.write(message);
  });

  if (this.io.socket.connected)
    connectCallback();
  else {
    this.on("connect", connectCallback);
  }
};

Juggernaut.fn.unsubscribe = function(channel) {
  if ( !channel ) throw "Must provide a channel";
  
  this.unbind(channel + ":data");
  
  var message     = new Juggernaut.Message;
  message.type    = "unsubscribe";
  message.channel = channel;

  this.write(message);
};

// Private

Juggernaut.fn.trigger = function(){
  var args = [];
  for (var f=0; f < arguments.length; f++) args.push(arguments[f]);
  
  var name  = args.shift();

  var callbacks = this.handlers[name];
  if ( !callbacks ) return;

  for(var i=0, len = callbacks.length; i < len; i++)
    callbacks[i].apply(this, args);
};

Juggernaut.fn.writeMeta = function(){
  if ( !this.meta ) return;
  var message     = new Juggernaut.Message;
  message.type    = "meta";
  message.data    = this.meta;
  this.write(message);
};

Juggernaut.fn.onconnect = function(){
  this.sessionID = this.io.socket.sessionid;
  this.trigger("connect");
};

Juggernaut.fn.ondisconnect = function(){
  this.trigger("disconnect");
};

Juggernaut.fn.onmessage = function(data){
  var message = Juggernaut.Message.fromJSON(data);
  this.trigger("message", message);
  this.trigger("data", message.channel, message.data);
  this.trigger(message.channel + ":data", message.data);
};

Juggernaut.Message = function(hash){
  for (var key in hash) this[key] = hash[key];
};

Juggernaut.Message.fromJSON = function(json){
  return(new this(JSON.parse(json)))
};

Juggernaut.Message.prototype.toJSON = function(){
  var object = {};
  for (var key in this) {
    if (typeof this[key] != "function")
      object[key] = this[key];
  }
  return(JSON.stringify(object));
};