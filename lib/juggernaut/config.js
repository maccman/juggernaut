/*  
    Configuration file, all the variables will be avaliable 
    with Config.whatever, if we've exported and required this file
*/

var Config = {
  
  /*  This config is required whether we are in secure mode or not,
      so if we are not in secure mode, we can run things as usual 
      checking that secure_mode is false 
  */
  secure_mode: false,
  
  /*  This is required in secure mode, and it 
      must be the same string you'll have on the server, like:
      
      sharedToken = 'e91d6517cbebe25100607b797f9c2fdc60d2df61',

      By defualt it's not defined.
  */ 
  sharedToken: '',
  
  // The time it takes until a signature expires, in seconds
  expiration: 40, 
};

module.exports = Config;