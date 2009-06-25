require 'rubygems'

gem 'jpbougie-couchrest'
require 'couchrest'

gem 'mperham-memcache-client'
require 'memcache'


module Sift
  class << self
    attr_accessor :database
    attr_accessor :queue_server
    attr_accessor :yahoo_appid
    
    def queue
      @queue ||= MemCache.new Sift.queue_server
    end
  end
  
  class Entry < CouchRest::ExtendedDocument  
    property :entry
    property :source
    property :rating
    property :tags
    property :stanford
    property :features_rating
    
    timestamps!
    
    view_by :rating
    view_by :no_rating,
        :map =>
          "function(doc) {
             if((doc['couchrest-type'] == 'Sift::Entry') && !doc['rating']) {
               emit(null, null);
             }
           }"
    
    create_callback :after do |object|
      object.post_job
    end
    
    def post_job
      payload = { "key" => self.id, "question" => self.entry }
      Sift.queue.set("stanford", payload.to_json, 0, true)
      true
    end
    
    # Paginate the entries according to the following params
    # - rating => 1..5 or nil, to limit to a specific rating or the absence of rating
    # - limit => 1..n, with a default of 50
    # - descending => true|false to change the order
    # - start => the last id from the previous page, will be skipped
    
    def self.paginate(params = {})
      options = {:limit => 50, :descending => false}.merge(params)
      view_params = prepare_params_for_pagination(options)

      if options.has_key? :rating
        if options[:rating]
          self.by_rating view_params
        else
          self.by_no_rating view_params
        end
      else
        self.all view_params
      end
    end
    
    def previous_start(params = {})
      params[:descending] = params[:descending].nil? ? true : !params[:descending] # reverse the order
      
      entries = self.paginate(params)
      if entries.length > 0
        entries.last.id
      else # we are already at the beginning
        params[:start]
      end
    end
    
    # same params as before, will return the count
    def self.count(params = {})
      options = {:descending => false}.merge(params)
      view_params = self.prepare_params_for_pagination(options)
      view_params[:include_docs] = false
      view_params[:raw] = true
      
      view_params.delete :limit
      
      if options.has_key? :rating
        if options[:rating] # the total_rows is for the entire view, which is 
          self.by_rating(view_params)['rows'].length
        else
          self.by_no_rating(view_params)['total_rows']
        end
      else
        self.all(view_params)['total_rows']
      end
    end
    
    def self.prepare_params_for_pagination(options)
      view_params = {}
      view_params[:limit] = options[:limit]
      view_params[:descending] = options[:descending]
      if options.has_key? :rating and options[:rating]
        view_params[:key] = options[:rating]
      end
      if options[:start]
        view_params[:skip] = 1
        view_params[:startkey] = options[:rating] # nil or a rating
        view_params[:startkey_docid] = options[:start]
      end
      
      view_params
    end
  end
  
  def self.connect_database
      Entry.use_database CouchRest.database!(Sift.database)
  end
  
  class Question
    include HTTParty
    format :xml

    # use :name to find by name or :cid to find by id
    def self.find_by_category(options = {})
      query = { :appid => Sift.yahoo_appid, :results => 50, :start => rand(50) * 50 }
      if options[:cid]
        query[:category_id] = options[:cid]
      else
        query[:category_name] = options[:name]
      end

      get('http://answers.yahooapis.com/AnswersService/V1/getByCategory', :query => query)
    end
    
    def self.load_as_entries
      questions = self.find_by_category(:cid => "396545469")["ResultSet"]["Question"]
      
      for q in questions
        e = Entry.new(:entry => q["Subject"], :source => q["Link"])
        e.save
      end
    end
  end
  
  
end