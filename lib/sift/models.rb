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

    timestamps!
  
    save_callback :after do |object|
      object.push_job
    end
    
    def push_job
      payload = { "key" => self.id, "question" => self.entry }
      Sift.queue.set("stanford", payload.to_json, 0, true)
      true
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