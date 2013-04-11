#! /usr/bin/env ruby
# encoding: utf-8

require 'rspec/core/rake_task'

task :default => :test
task :test => :spec
task :test_network => :spec_network
task :test_all => :spec_all

desc "Run basic RSpec tests"
RSpec::Core::RakeTask.new(:spec) do |task|
  task.rspec_opts = '--color --format documentation'
  task.rspec_opts += ' --tag ~speed:slow'
end

desc "Run all RSpec tests (might take a while)"
RSpec::Core::RakeTask.new(:spec_all) do |task|
  task.rspec_opts = '--color --format documentation'
end

desc "Run RSpec tests that connect to remote URLs (might take a while)"
RSpec::Core::RakeTask.new(:spec_network) do |task|
  task.rspec_opts = '--color --format documentation'
  task.rspec_opts += ' --tag network:true'
end
