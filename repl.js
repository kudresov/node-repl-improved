#!/usr/bin/env node
const repl = require('repl');
const util = require('util');
const { spawn } = require('child_process');
const ora = require('ora');

let replServer;

function writer(output) {
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

console.log('Welcome to improved REPL');
replServer = repl.start({
  writer
});

const snakeToCamel = s => s.replace(/(\-\w)/g, m => m[1].toUpperCase());

replServer.defineCommand('install', {
  help: 'Install npm module',
  action(moduleName) {
    const npm = spawn('npm', ['install', moduleName, '--save', '--silent']);
    const spinner = ora(`Installing ${moduleName}`).start();

    npm.stdout.on('data', data => {
      console.log(data.toString('utf8'));
    });

    npm.stderr.on('data', data => {
      spinner.fail(data.toString('utf8'));
    });

    npm.on('close', code => {
      if (code !== 0) {
        console.log(`Error installing node module code: ${code}`);
        return;
      }
      spinner.succeed(`${moduleName} has been installed successfully!`);
      const varName = snakeToCamel(moduleName);
      replServer.context[moduleName] = require(moduleName);
      console.log(`Module has been loaded as \`${varName}\``);
      replServer.clearBufferedCommand();
      replServer.displayPrompt();
    });
  }
});
