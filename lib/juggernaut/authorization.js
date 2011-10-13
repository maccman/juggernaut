var sys    = require("sys");
var crypto = require("crypto");
var redis  = require("redis");
var Config = require('./config');

Authorization = module.exports = {};

Authorization.redisClient = redis.createClient();

Authorization.recordSignature = function(client, signature) {
  var redisClient = this.redisClient;

  redisClient.setnx(signature, 1, function(err, res) {
    if (res === 1) {
      redisClient.expire(signature, 90);
      sys.log("Recording signature " + signature + " as used.");
    } else {
      sys.log("Signature " + signature + " has already been used! Issuing client disconnect.");
      // Bump the juggernaut client off for reusing a token
      client.disconnect();
    }
  });
};

Authorization.expiredSignature = function(timestamp) {
  var signatureAge = Math.round(new Date().getTime()/1000.0) - 
                     Math.round(parseInt(timestamp, 10) / 1000.0);
                              
  return signatureAge > Config.expiration;
};

Authorization.validateSignature = function(client, message) {
  // If we are not in secure mode validateSignature always returns true
  if (!Config.secure_mode) {
    return true;
  }
  

  var channelName = message.getChannel(),
      signature   = message.getSignature(),
      timestamp   = message.getTimestamp(),
      hash        = crypto.createHash('sha1');

  if (this.expiredSignature(timestamp)) {
      return false;
  }
  
  this.recordSignature(client, signature);
  
  hash.update([Config.sharedToken, channelName, timestamp].join(':'));
  
  if (signature === hash.digest('hex')) { 
    return true;
  } else {
    sys.log("Signature mismatch!");
    return false;
  }
};
