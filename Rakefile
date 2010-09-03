require "tempfile"
require "yui/compressor"
require "fileutils"

task :build do
  APP_PATH = File.expand_path("./public/application.js")
  `sprocketize -I public/ public/juggernaut.js > #{APP_PATH}`
  
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