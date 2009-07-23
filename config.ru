require File.dirname(__FILE__) + "sift.rb"
 
set :run, false
set :environment, ENV['APP_ENV'] || :production
 
run Sinatra::Application
