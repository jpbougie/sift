require 'rubygems'
require 'sinatra'

gem 'chriseppstein-compass'
require 'compass'


$: << File.join(File.dirname(__FILE__), 'lib')
require 'sift/models'

configure do
  require 'config/sift.rb'
  Sift.connect_database
  Compass.configuration do |config|
    config.project_path = File.dirname(__FILE__)
    config.sass_dir     = File.join('views', 'stylesheets')
  end
end

get "/stylesheets/:name.css" do |name|
  content_type 'text/css'

  # Use views/stylesheets & blueprint's stylesheet dirs in the Sass load path
  sass :"stylesheets/#{name}", :sass => Compass.sass_engine_options
end

get "/" do
  haml :index
end