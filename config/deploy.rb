default_run_options[:pty] = true

#set :port, 29209
set :use_sudo, :false

set :application, "sift"
set :repository,  "git://github.com/jpbougie/sift.git"

set :deploy_to, "/var/www/#{application}"

set :scm, :git
set :user, "bozzon"
#set :branch, :master

role :app, "131.175.57.39"
role :web, "131.175.57.39"
role :db,  "131.175.57.39", :primary => true

set :config_path, "/usr/local/sift/config"


namespace :deploy do
    task :after_symlink, :role => :app do
      run "ln -sf #{config_path}/sift.rb #{current_path}/config/sift.rb"
    end
    
    task :restart, :roles => :app, :except => { :no_release => true } do
      run "touch #{current_path}/restart.txt"
    end
end