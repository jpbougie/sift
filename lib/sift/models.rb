require 'rubygems'
require 'couchrest'

module Sift
  class << self
    attr_accessor :database
  end
  
  class Entry < CouchRest::ExtendedDocument  
    property :entry
    property :source
    property :rating
    property :tags
    property :stanford

    timestamps!
  
    #save_callback :after do |object|
    #  QUEUE.set("stanford", {:key => object.id, :question => self.entry }.to_json, 0, true)
    #end

  end
  
  def self.connect_database
      Entry.use_database CouchRest.database!(Sift.database)
  end
end