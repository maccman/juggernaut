require "tempfile"
require "yui/compressor"
require "fileutils"
require "sprockets"

APP_PATH    = File.expand_path("./public/application.js")
CLIENT_PATH = File.expand_path("./client.js")

task :build do
  env = Sprockets::Environment.new
  env.append_path 'client/vendor/assets/javascripts'
  File.open(APP_PATH, 'w') { |f| f << env['juggernaut.js'].to_s }
  File.open(CLIENT_PATH, 'w') { |f| f << env['juggernaut.js'].to_s }
end

task :compress do
  tempfile   = Tempfile.new("yui")
  compressor = YUI::JavaScriptCompressor.new(:munge => true)
  File.open(APP_PATH, "r") do |file|
    compressor.compress(file) do |compressed|
      while buffer = compressed.read(4096)
        tempfile.write(buffer)
      end
    end
  end
  
  tempfile.close
  FileUtils.mv(tempfile.path, APP_PATH)
end

task :default => [:build, :compress]
