var util    = require("util");

var Logger = (function() {
  this.silent = false;

  function log(msg) {
    if (!this.silent) {
      util.log(msg);
    }
  }

  return {
    log: log
  };
})();

module.exports = Logger;
