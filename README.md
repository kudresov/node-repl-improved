# Overview
This is an improved version of the default node repl.

# Installing and running
To install simply run `npm i -g node-repl-improved`. After it's installed you can invoke it by running `repl`.

# Improvements
Use `.help` to list of all available commands. Currently there are 2 new commands: 

1. `.install [repo-name]` installs a repo from npm into a temporary directory and allows to require it straight away. All installed repos are removed from the temp location after exit.

2. `.repo [repo-name]` opens repo github page

## Other improvements
This version of repl formats output using colour and better formatting.
