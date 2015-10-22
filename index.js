import cryptico from 'cryptico'
import commander from 'commander'
import chalk from 'chalk'
import _ from 'lodash'
import readlineSync from 'readline-sync'
import path from 'path'
import fs from 'fs'

var [filename, ...additionalArgs] = process.argv.slice(2),
  cwd = process.cwd();

commander
  .option('-l --level <string>', 'Log level')
  .option('-p --phrase <string>', 'Pass phrase')
  .option('-b --bits <number>', 'Number of bits')
  .option('-k --keyfile <string>', 'Key filename')
  .parse(process.argv);

var defaultOptions = {
  phrase: 'crytess',
  bits: 1024,
  keyfile: ''
}
var options = _.defaults(
    _.pick(commander, _.keys(defaultOptions)),
    defaultOptions
);

if (!filename) {
  console.error(chalk.red('should provide a filename'));
  process.exit();
}

var RSAKeyString;
new Promise( function(resolve) {
  if (options.keyfile) {
    try {
      RSAKeyString = fs.readFileSync(path.resolve(cwd, options.keyfile)).toString();
      resolve(RSAKeyString)
    } catch(err) {
      resolve()
    }
  }
  resolve();
}).then( function() {
  if (!RSAKeyString) {
    if (!options.phrase) {
      options.phrase = readlineSync.question("Let's get some phrase: ", {
        hideEchoBack: true
      });
    }

    var RSAKey = cryptico.generateRSAKey(options.phrase, 1024);
    RSAKeyString = cryptico.publicKeyString(RSAKey);
  }
  if (!RSAKeyString) {
    return Promise.reject();
  }
  return Promise.resolve(RSAKeyString);
}).then( function() {
  if (true) {}
  var filePath = path.resolve(cwd, filename),
    fileContent = fs.readFileSync(filePath).toString(),
    encryptedObj = cryptico.encrypt(fileContent, RSAKeyString);
  var encryptedCnt = encryptedObj.cipher;
  console.log(encryptedCnt);
})

