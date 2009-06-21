default_run_options[:pty] = true

set :port, 29209
set :use_sudo, :false

set :application, "sift"
set :repository,  "git://github.com/jpbougie/sift.git"

set :deploy_to, "/var/www/#{application}"

set :scm, :git
set :user, "siphon"
#set :branch, :master

role :app, "jpbougie.net"
role :web, "jpbougie.net"
role :db,  "jpbougie.net", :primary => true

set :config_path, "/home/siphon/config"


namespace :deploy do
    task :after_symlink, :role => :app do
      run "ln -sf #{config_path}/sift.rb #{current_path}/config/sift.rb"
    end
    
    task :restart, :roles => :app, :except => { :no_release => true } do
      run "god restart sift"
    end
end