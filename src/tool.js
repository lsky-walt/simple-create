import chalk from 'chalk'
import spawn from 'cross-spawn'

export const promiseSpawn = ({
  command = '',
  args = [],
  option = {},
}) => new Promise((resolve, reject) => {
  if (!command || args.length <= 0) {
    console.log(chalk.bold.red('参数不全，无法执行spawn命令...'))
    console.log()
    reject(new Error('参数不全，无法执行spawn命令...'))
    process.exit(1)
    return
  }
  const child = spawn(command, args, { ...option, stdio: 'inherit' });
  child.on('close', code => {
    if (code !== 0) {
      reject({
        command: `${command} ${args.join(' ')}`,
      });
      return;
    }
    resolve(true);
  });
})

