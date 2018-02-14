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

replServer.defineCommand('install', {
  help: 'Install npm module',
  action(moduleName) {
    const npm = spawn('npm', ['install', 'ramda', '--save', '--silent']);
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
      replServer.clearBufferedCommand();
      replServer.displayPrompt();
    });
  }
});
