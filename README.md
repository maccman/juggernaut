#Juggernaut

Juggernaut gives you a realtime connection between your servers and client browsers. 
You can literally push data to clients using your web application, which lets you do awesome things like multiplayer gaming, chat, group collaboration and more. 

Juggernaut is built on top of [Node.js](http://nodejs.org) and is super simple and easy to get going. 

##Features

* [Node.js](http://nodejs.org) server
* Ruby client
* Supports the following protocols:
  * WebSocket
  * Adobe Flash Socket
  * ActiveX HTMLFile (IE)
  * Server-Sent Events (Opera)
  * XHR with multipart encoding
  * XHR with long-polling
* Horizontal scaling
* Reconnection support 
* SSL support

As you can see, Juggernaut supports a variety of protocols. If one isn't supported by a client, Juggernaut will fallback to one that is. 

Supported browsers are:

* Desktop
  * Internet Explorer >= 5.5
  * Safari >= 3
  * Google Chrome >= 4
  * Firefox >= 3
  * Opera 10.61
* Mobile
  * iPhone Safari
  * iPad Safari
  * Android WebKit
  * WebOs WebKit

##Requirements

* Node.js
* Redis
* Ruby (optional)

##Setup

###Install [Node.js](http://nodejs.org)

If you're using the [Brew](http://mxcl.github.com/homebrew) package management system, use that:

    brew install node

Or follow the [Node build instructions](https://github.com/joyent/node/wiki/Installation)

###Install [Redis](http://code.google.com/p/redis)

If you're using the Brew package, use that:

    brew install redis
    
Or follow the [Redis build instructions](http://redis.io/download)

###Install Juggernaut

Juggernaut is distributed by [npm](http://npmjs.org), you'll need to [install that](http://npmjs.org) first if you haven't already.

    npm install -g juggernaut

###Install the [Juggernaut client gem](http://rubygems.org/gems/juggernaut)

This step is optional, but if you're planning on using Juggernaut with Ruby, you'll need the gem.

    gem install juggernaut

##Running

Start Redis:
  
    redis-server

Start Juggernaut:

    juggernaut

That's it! Now go to [http://localhost:8080](http://localhost:8080) to see Juggernaut in action.

##Basic usage

Everything in Juggernaut is done within the context of a channel. JavaScript clients can subscribe to a channel which your server can publish to.
First, we need to include Juggernaut's application.js file. By default, Juggernaut is hosted on port 8080 - so we can just link to the file there.

    <script src="http://localhost:8080/application.js" type="text/javascript" charset="utf-8"></script>
    
We then need to instantiate the Juggernaut object and subscribe to the channel. As you can see, subscribe takes two arguments, the channel name and a callback.

    <script type="text/javascript" charset="utf-8">
      var jug = new Juggernaut;
      jug.subscribe("channel1", function(data){
        console.log("Got data: " + data);
      });
    </script>
    
That's it for the client side. Now, to publish to the channel we'll write some Ruby:

    require "juggernaut"
    Juggernaut.publish("channel1", "Some data")

You should see the data we sent appear instantly in the [open browser window](http://localhost:8080).
As well as strings, we can even pass objects, like so:

    Juggernaut.publish("channel1", {:some => "data"})

The publish method also takes an array of channels, in case you want to send a message to multiple channels co-currently. 

    Juggernaut.publish(["channel1", "channel2"], ["foo", "bar"])

That's pretty much the gist of it, the two methods - publish and subscribe. Couldn't be easier than that!

##Flash

Adobe Flash is optional, but it's the default fallback for a lot of browsers until WebSockets are supported.
However, Flash needs a XML policy file to be served from port 843, which is restricted. You'll need to run Juggernaut with root privileges in order to open that port.

    sudo juggernaut
    
You'll also need to specify the location of WebSocketMain.swf. Either copy this file (from Juggernaut's public directory) to the root public directory of your application, or specify it's location before instantiating Juggernaut:

    window.WEB_SOCKET_SWF_LOCATION = "http://juggaddress:8080/WebSocketMain.swf"
    
As I mentioned above, using Flash with Juggernaut is optional - you don't have to run the server with root privileges. If Flash isn't available, Juggernaut will use [WebSockets](http://en.wikipedia.org/wiki/WebSocket) (the default), [Comet](http://goo.gl/lO6S) or polling. 

##SSL

Juggernaut has SSL support! To activate, just put create a folder called 'keys' in the 'juggernaut' directory, 
containing your privatekey.pem and certificate.pem files. 

    >> mkdir keys
    >> cd keys
    >> openssl genrsa -out privatekey.pem 1024 
    >> openssl req -new -key privatekey.pem -out certrequest.csr 
    >> openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem

Then, pass the secure option when instantiating Juggernaut in JavaScript:

    var juggernaut = new Juggernaut({secure: true})
    
All Juggernaut's communication will now be encrypted by SSL.

##Scaling

The only centralised (i.e. potential bottle neck) part to Juggernaut is Redis. 
Redis can support hundreds of thousands writes a second, so it's unlikely that will be an issue. 

Scaling is just a case of starting up more Juggernaut Node servers, all sharing the same Redis instance. 
Put a TCP load balancer in front them, distribute clients with a Round Robin approach, and use sticky sessions. 

It's worth noting that the latest WebSocket specification breaks support for a lot of HTTP load balancers, so it's safer just using a TCP one.

##Client Events

Juggernaut's JavaScript client has a few events that you can bind to:

* connect
* disconnect
* reconnect

Juggernaut also triggers data events in the context of an channel. You can bind to that event by just passing a callback to the subscribe function.
Here's an example of event binding. We're using [jQuery UI](http://jqueryui.com) to show a popup when the client loses their connection to our server.

    var jug = new Juggernaut;

    var offline = $("<div></div>")
    	.html("The connection has been disconnected! <br /> " + 
    	      "Please go back online to use this service.")
    	.dialog({
    		autoOpen: false,
    		modal:    true,
    		width:    330,
    		resizable: false,
    		closeOnEscape: false,
    		title: "Connection"
    	});

    jug.on("connect", function(){ 
      offline.dialog("close");
    });

    jug.on("disconnect", function(){ 
      offline.dialog("open");
    });
    
    // Once we call subscribe, Juggernaut tries to connnect.
    jug.subscribe("channel1", function(data){
      console.log("Got data: " + data);
    });

##Excluding certain clients

It's a common use case to send messages to every client, except one. For example, this is a common chat scenario:

* User creates chat message
* User's client appends the message to the chat log, so the user sees it instantly
* User's client sends an AJAX request to the server, notifying it of the new chat message
* The server then publishes the chat message to all relevant clients

Now, the issue above is if the server publishes the chat message back to the original client. In which case, it would get duplicated in the chat logs (as it already been created). We can resolve this issue by recording the client's Juggernaut ID, and then passing it as an `:except` option when Juggernaut publishes.

You can pass the Juggernaut session ID along with any AJAX requests by hooking into `beforeSend`, which is triggered by jQuery before sending any AJAX requests. The callback is passed an XMLHttpRequest, which we can use to set a custom header specifying the session ID.

    var jug = new Juggernaut;
    
    jQuery.beforeSend(function(xhr){
      xhr.setRequestHeader("X-Session-ID", jug.sessionID);
    });
    
Now, when we publish to a channel, we can pass the `:except` option, with the current client's session ID. 

    Juggernaut.publish(
      "/chat",
      params[:body],
      :except => request.headers["X-Session-ID"]
    )
    
Now, the original client won't get the duplicated chat message, even if it's subscribed to the __/chat__ channel.

##Server Events

When a client connects & disconnects, Juggernaut triggers a callback. You can listen to these callbacks from the Ruby client,

    Juggernaut.subscribe do |event, data|
      # Use event/data
    end

The event is either `:subscribe` or `:unsubscribe`. The data variable is just a hash of the client details:

    {"channel" => "channel1", "session_id" => "1822913980577141", "meta" => "foo"}

##Metadata

You'll notice there's a meta attribute in the server event example above. Juggernaut lets you attach meta data to the client object,
which gets passed along to any server events. For example, you could set User ID meta data - then you would know which user was subscribing/unsubscribing to channels. You could use this information to build a live Roster of online users.

    var jug = new Juggernaut;
    jug.meta = {user_id: 1};
    
##Using Juggernaut from Python

You don't have to use Ruby to communicate with Juggernaut. In fact, all that is needed is a [Redis](http://code.google.com/p/redis) adapter. Here we're using [Python](http://www.python.org) with [redis-py](http://github.com/andymccurdy/redis-py).

    import redis
    import json

    msg = {
      "channels": ["channel1"],
      "data": "foo"
    }

    r = redis.Redis()
    r.publish("juggernaut", json.dumps(msg))
    
##Using Juggernaut from Node.js

Similar to the Python example, we can use a Node.js Redis adapter to publish to Juggernaut.

    var redis   = require("redis");

    var msg = {
      "channels": ["channel1"],
      "data": "foo"
    };

    var client = redis.createClient();
    client.publish("juggernaut", JSON.stringify(msg));

##Building a Roster

So, let's take all we've learnt about Juggernaut, and apply it to something practical - a live chat roster.
Here's the basic class. We're using [SuperModel](http://github.com/maccman/supermodel) with the Redis adapter. Any changes to the model will be saved to our Redis data store. We're also associating each Roster record with a user.

    class Roster < SuperModel::Base
      include SuperModel::Redis::Model
      include SuperModel::Timestamp::Model

      belongs_to :user
      validates_presence_of :user_id
  
      indexes :user_id
    end
    
Now let's integrate the Roster class with Juggernaut. We're going to listen to Juggernaut's server events - fetching the user_id out of the events meta data, and calling __event_subscribe__ or __event_unsubscribe__, depending on the event type.
    
    def self.subscribe
      Juggernaut.subscribe do |event, data|
        user_id = data["meta"] && data["meta"]["user_id"]
        next unless user_id
          
        case event
        when :subscribe
          event_subscribe(user_id)
        when :unsubscribe
          event_unsubscribe(user_id)
        end
      end
    end
        
Let's implement those two methods __event_subscribe__ & __event_unsubscribe__. We need to take into account they may be called multiple times for a particular user_id, if a User opens multiple browser windows co-currently. 
    
    def event_subscribe(user_id)
      record = find_by_user_id(user_id) || self.new(:user_id => user_id)
      record.increment!
    end

    def event_unsubscribe(user_id)
      record = find_by_user_id(user_id)
      record && record.decrement!
    end
    
We need to add a __count__ attribute to the Roster class, so we can track if a client has completely disconnected from the system.
Whenever clients subscribes to a channel, __increment!__ will get called and the __count__ attribute will be incremented, conversly whenever they disconnect from that channel __decrement!__ will get called and __count__ decremented.

    attributes :count
    
    def count
      read_attribute(:count) || 0
    end

    def increment!
      self.count += 1
      save!
    end

    def decrement!
      self.count -= 1
      self.count > 0 ? save! : destroy
    end

When __decrement!__ is called, we check to see if the count is zero, i.e. a client is no longer connected, and destroy the record if necessary. Now, at this point we have a live list of Roster records indicating who's online. We just need to call __Roster.subscribe__, say in a Rails script file, and Juggernaut events will be processed.

    #!/usr/bin/env ruby
    require File.expand_path('../../config/environment',  __FILE__)

    puts "Starting Roster"
    Roster.subscribe 

There's no point, however, in having a live Roster unless we can show that to users - which is the subject of the next section, observing models. 

##Observing models

We can create an Juggernaut observer, which will observe some of the models, notifying clients when they're changed.

    class JuggernautObserver < ActiveModel::Observer
      observe :roster
      
      def after_create(rec)
        publish(:create, rec)
      end
  
      def after_update(rec)
        publish(:update, rec)
      end
  
      def after_destroy(rec)
        publish(:destroy, rec)
      end
  
      protected
        def publish(type, rec)
          channels = Array(rec.observer_clients).map {|c| "/observer/#{c}" }
          Juggernaut.publish(
            channels, 
            {
              :id     => rec.id, 
              :type   => type, 
              :klass  => rec.class.name,
              :record => rec
            }
          )
        end
    end
    
So, you can see we're calling the publish method whenever a record is created/updated/destroyed. You'll notice that we're calling __observer_clients__ on the updated record. This is a method that application specific, and needs to be implemented on the Roster class. It needs to return an array of user_ids associated with the record.

So, as to the JavaScript side to the observer, we need to subscribe to a observer channel and set a callback. Now, whenever a __Roster__ record is created/destroyed, the process function will be called. We can then update the UI accordingly.

    var process = function(msg){
      // msg.klass
      // msg.type
      // msg.id
      // msg.record 
    };
    
    var jug = new Juggernaut;
    jug.subscribe("/observer/" + user_id, process);

##Full examples

You can see the full examples inside [Holla](http://github.com/maccman/holla), specifically [roster.rb](https://github.com/maccman/holla/blob/original/app/models/roster.rb),  [juggernaut_observer.rb](https://github.com/maccman/holla/blob/original/app/observers/juggernaut_observer.rb) and [application.juggernaut.js](https://github.com/maccman/holla/blob/original/app/javascripts/application.juggernaut.js).