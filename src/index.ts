#!/usr/bin/env node

import * as repl from 'repl';
import * as util from 'util';
import { spawn } from 'child_process';
import * as ora from 'ora';
import * as chalk from 'chalk';

const loadedModules: string[] = [];

let replServer: repl.REPLServer;

function writer(output: any) {
  if (!output) {
    return;
  }

  if (output.format) {
    return util.inspect(output.format(), {
      showHidden: false,
      depth: 5,
      colors: true
    });
  }

  return util.inspect(output, { colors: true });
}

console.log(
  (chalk as any).blue(`
                __                            __     __                                          __ 
.-----.-----.--|  .-----.   .----.-----.-----|  |   |__.--------.-----.----.-----.--.--.-----.--|  |
|     |  _  |  _  |  -__|   |   _|  -__|  _  |  |   |  |        |  _  |   _|  _  |  |  |  -__|  _  |
|__|__|_____|_____|_____|   |__| |_____|   __|__|   |__|__|__|__|   __|__| |_____|\\___/|_____|_____|
                                       |__|                     |__|                                
`)
);
console.log('Run .help to get the list of all commands');
replServer = repl.start({
  writer
});

const snakeToCamel = (s: string) =>
  s.replace(/(\-\w)/g, m => m[1].toUpperCase());

replServer.defineCommand('install', {
  help: 'Install npm module',
  action(moduleName: string) {
    if (!moduleName) {
      console.warn(
        'No module specified. Run `.install npm-module-name` to install a module'
      );
      return;
    }

    if (loadedModules.includes(moduleName)) {
      console.log(
        `${moduleName} has been already loaded. You can access it as ${snakeToCamel(
          moduleName
        )}`
      );
      return;
    }
    const npm = spawn('npm', [
      'install',
      moduleName,
      '--silent',
      '--prefix',
      __dirname
    ]);
    const spinner = ora(`Installing ${moduleName}`).start();

    npm.stdout.on('data', data => {
      console.log(data.toString());
    });

    npm.stderr.on('data', data => {
      spinner.fail(data.toString());
    });

    npm.on('close', code => {
      if (code !== 0) {
        console.log(`Error installing node module code: ${code}`);
        return;
      }
      spinner.succeed(`${moduleName} has been installed successfully!`);
      loadedModules.push(moduleName);
      const varName = snakeToCamel(moduleName);
      replServer.displayPrompt();
      replServer.write(`const ${varName} = require('${moduleName}');`);
    });
  }
});

replServer.defineCommand('repo', {
  help: 'Open repo github page',
  action(moduleName: string) {
    if (!moduleName) {
      console.warn(
        'No module specified. Run `.repo npm-module-name` to open module homepage'
      );
      return;
    }

    const npm = spawn('npm', ['repo', moduleName]);

    npm.stdout.on('data', data => {
      console.log(data.toString());
    });

    npm.stderr.on('data', data => {
      console.log(data.toString());
    });

    npm.on('close', code => {
      if (code !== 0) {
        console.log(`Error opening repo, status code: ${code}`);
        return;
      }
      replServer.displayPrompt();
    });
  }
});

replServer.defineCommand('find', {
  help: 'Search npm registry',
  action(searchTerm: string) {
    if (!searchTerm) {
      console.log(
        'No search term. Run `.find search-term` to search for npm module'
      );
      return;
    }

    const npm = spawn('npm', ['find', '--long', searchTerm]);

    npm.stdout.on('data', data => {
      console.log(data.toString());
    });

    npm.stderr.on('data', data => {
      console.log(data.toString());
    });

    npm.on('close', code => {
      if (code !== 0) {
        console.log(`Error searching npm, status code: ${code}`);
        return;
      }
      replServer.displayPrompt();
    });
  }
});

replServer.on('exit', () => {
  if (!loadedModules.length) {
    process.exit();
  }
  const spinner = ora('Cleaning up before exit').start();

  const npm = spawn('npm', [
    'uninstall',
    ...loadedModules,
    '--prefix',
    __dirname
  ]);

  // npm.stderr.on('data', data => {
  //   spinner.fail(data.toString('utf8'));
  // });

  // npm.stdout.on('data', data => {
  //   console.log(data.toString('utf8'));
  // });

  npm.on('close', code => {
    if (code !== 0) {
      console.log(`Error deleting npm modules, status code: ${code}`);
      return;
    }
    spinner.stop();
    process.exit();
  });
});
