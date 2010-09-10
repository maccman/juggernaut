require "redis"
require "json"

module Juggernaut
  def redis
    @redis ||= Redis.new
  end
  
  def redis=(val)
    @redis = val
  end

  def publish(channels, data, options = {})
    message = ({:channels => Array(channels), :data => data}).merge(options)
    redis.publish(:juggernaut, message.to_json) 
  end

  extend self
end