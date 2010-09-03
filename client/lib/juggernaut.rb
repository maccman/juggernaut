require "redis"
require "json"

module Juggernaut
  def redis
    @redis ||= Redis.new
  end
  
  def redis=(val)
    @redis = val
  end

  def publish(channels, data)
    message = {:channels => Array(channels), :data => data}
    redis.publish(:juggernaut, message.to_json) 
  end

  extend self
end