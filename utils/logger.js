const chalk = require('chalk');

const info = (msg) => console.log(chalk.cyan('[INFO]'), msg);
const success = (msg) => console.log(chalk.green('[SUCCESS]'), msg);
const warn = (msg) => console.warn(chalk.yellow('[WARN]'), msg);
const error = (msg) => console.error(chalk.red('[ERROR]'), msg);

module.exports = {
  info,
  success,
  warn,
  error,
};
