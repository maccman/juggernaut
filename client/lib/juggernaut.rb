require "redis"
require "json"

module Juggernaut
  def redis_options
    @redis_options ||= {}
  end
  
  def publish(channels, data, options = {})
    message = ({:channels => Array(channels).uniq, :data => data}).merge(options)
    redis.publish(key, message.to_json) 
  end
  
  def subscribe
    Redis.new(redis_options).subscribe("juggernaut:*") do |on|
      on.message do |type, msg|
        yield(type.gsub(/^juggernaut:/, "").to_sym, JSON.parse(msg))
      end
    end
  end
  
  protected
    def redis
      @redis ||= Redis.new(redis_options)
    end
  
    def key(*args)
      args.unshift(:juggernaut).join(":")
    end

    extend self
end