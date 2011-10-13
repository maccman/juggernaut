Message = module.exports = function(hash){
  for (var key in hash) this[key] = hash[key];
};

Message.fromJSON = function(json){
  return(new this(JSON.parse(json)))
};

Message.prototype.toJSON = function(){
  var object = {};
  for (var key in this) {
    if (typeof this[key] != "function")
      object[key] = this[key];
  }
  return(JSON.stringify(object));
};

Message.prototype.getChannels = function(){
  return(Array.makeArray(this.channels || this.channel));
};

Message.prototype.getChannel = function(){
  return(this.getChannels()[0]);
};

Message.prototype.getSignature = function(){
  return(this.signature);
};

Message.prototype.getTimestamp = function(){
  return(this.timestamp);
};