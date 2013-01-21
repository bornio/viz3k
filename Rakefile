#! /usr/bin/env ruby
# encoding: utf-8

require 'rspec/core/rake_task'

task :default => :test
task :test => :spec

desc "Run all RSpec tests (run as the task \"spec\")"
RSpec::Core::RakeTask.new do |task|
  task.rspec_opts = '--color --format documentation'
end
