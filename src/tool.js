import chalk from "chalk"
import spawn from "cross-spawn"

export const promiseSpawn = ({ command = "", args = [], option = {} }) =>
  new Promise((resolve, reject) => {
    if (!command || args.length <= 0) {
      console.log(stressError("参数不全，无法执行spawn命令..."))
      console.log()
      reject(new Error("参数不全，无法执行spawn命令..."))
      process.exit(1)
    }
    const child = spawn(command, args, { ...option, stdio: "inherit" })
    child.on("close", (code) => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(" ")}`,
        })
        return
      }
      resolve(true)
    })
  })

/**
 * 公共约定
 *  info: chalk.cyan
 *  stress info: chalk.bold.cyan
 *
 *  warn: chalk.yellow
 *  stress warn: chalk.bold.yellow
 *
 *  error: chalk.red
 *  stress error: chalk.bold.red
 *
 *  success: chalk.green
 *  stress success: chalk.bold.green
 *
 */

export const info = chalk.cyan
export const stressInfo = chalk.bold.cyan

export const warn = chalk.yellow
export const stressWarn = chalk.bold.yellow

export const error = chalk.red
export const stressError = chalk.bold.red

export const success = chalk.green
export const stressSuccess = chalk.bold.green
