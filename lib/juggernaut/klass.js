var Klass = module.exports = {
 initializer: function(){},
 init: function(){},

 prototype: {
   initializer: function(){},
   init: function(){}
 },

 create: function(include, extend){
   var object = Object.create(this);
   object.parent    = this;
   object.prototype = object.fn = Object.create(this.prototype);

   if (include) object.include(include);
   if (extend)  object.extend(extend);
   
   object.initializer.apply(object, arguments);
   object.init.apply(object, arguments);
   return object;
 },

 inst: function(){
   var instance = Object.create(this.prototype);
   instance.parent = this;

   instance.initializer.apply(instance, arguments);
   instance.init.apply(instance, arguments);
   return instance;
 },

 proxy: function(func){
   var thisObject = this;
   return(function(){ 
     return func.apply(thisObject, arguments); 
   });
 },
 
 proxyAll: function(){
   var functions = makeArray(arguments);
   for (var i=0; i < functions.length; i++)
     this[functions[i]] = this.proxy(this[functions[i]]);
 },

 include: function(obj){
   var included = obj.included || obj.setup;

   delete obj.included;
   delete obj.extended;
   delete obj.setup;

   for(var i in obj)
     this.fn[i] = obj[i];
   if (included) included.apply(this);
 },

 extend: function(obj){
   var extended = obj.extended || obj.setup;

   delete obj.included;
   delete obj.extended;
   delete obj.setup;

   for(var i in obj)
     this[i] = obj[i];
   if (extended) extended.apply(this);
 }
};

Klass.prototype.proxy    = Klass.proxy;
Klass.prototype.proxyAll = Klass.proxyAll;