require 'rubygems'
require 'sinatra'

gem 'haml-edge'
require 'haml'

gem 'chriseppstein-compass'
require 'compass'

require 'httparty'

$: << File.join(File.dirname(__FILE__), 'lib')
require 'sift/models'

configure do
  require 'config/sift.rb'
  Sift.connect_database
  Sift.queue # to initialize it, otherwise it sometimes times out
  Compass.configuration do |config|
    config.project_path = File.dirname(__FILE__)
    config.sass_dir     = File.join('views', 'stylesheets')
  end
end

helpers do
  def next_page_url(entries)
    url = []
    if !entries.empty?
      url.unshift("start=" + entries.last.id)
    end

    if params[:limit]
      url.unshift("limit=" + params[:limit])
    end
    
    if params[:rating]
      url.unshift("rating=" + params[:rating])
    end
    
    if params[:descending]
      url.unshift("descending=" + params[:descending])
    end
    
    "/?" + url.join("&")
  end
  
  def make_stars(current_rating = nil)
    haml :stars, :locals => { :current_rating => current_rating}, :layout => false
  end
end

get "/stylesheets/:name.css" do |name|
  content_type 'text/css'

  # Use views/stylesheets & blueprint's stylesheet dirs in the Sass load path
  sass :"stylesheets/#{name}", Compass.sass_engine_options
end

get "/" do
  opts = {}
  
  if params[:limit]
    opts[:limit] = params[:limit]
  end
  
  if params[:rating]
    if params[:rating] == "none"
      opts[:rating] = nil
    else
      opts[:rating] = params[:rating].to_i
    end
  end
  
  if params[:start]
    opts[:start] = params[:start]
  end
  
  if params[:descending]
    opts[:descending] = params[:descending]
  end
  
  if params.has_key? :previous
    params[:start] = params[:previous]
    opts[:start] = Sift::Entry.previous_start(params)
  end
  
  @entries = Sift::Entry.paginate(opts)
  @counts = Sift::Entry.counts

  haml :index
end

get "/more" do
  Sift::Question.load_as_entries
  
  redirect "/"
end

# rate the entry itself
post "/rate" do
  content_type :json
  # Receives a string like rating[<id>]=<rating>&rating[<id>]=<rating>&...
  entries = params[:rating].collect do |id, rating|
    if (0..5).include? rating.to_i
      entry = Sift::Entry.get(id)
      entry.rating = rating.to_i
      entry.save
      entry
    end
  end
  entries.reject {|e| e.nil? }.to_json
end

post "/rate/:feature/:id" do
  entry = Sift::Entry.get(params[:id])
  entry.features_rating ||= {}
  entry.features_rating[params[:feature]] = params[:rating].to_i
  entry.save
  "ok"
end

post "/new" do
  e = Sift::Entry.new(:entry => params["entry"], :source => "manual")
  e.save
  haml :_entry, :locals => { :entry => e }, :layout => false
end

__END__
@@stars
%ul.rating
  - for i in 1..5
    %li.star
      %a{ :href => "#", :class => (current_rating && i <= current_rating) ? "active" : "" }= i.to_s