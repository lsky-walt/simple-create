#!/usr/bin/env node

const commander = require("commander")
const chalk = require("chalk")
const generate = require("./lib/index")

// package.json
const packageJson = require("./package.json")

// global projectName
let projectName = null

const init = async () => {
  const app = new commander.Command(packageJson.name)
    .version(packageJson.version)
    .arguments("<project-name>")
    .usage(`${chalk.green("project-name")} [options]`)
    .action((name) => {
      projectName = name
    })
    .option("--use-npm", "use npm to install")
    .option("--template <template>", "use target template", "react")
    .option("--online <url>", "github http url.")
    .allowUnknownOption()
    .on("--help", () => {
      console.log("create money tools.")
    })
    .parse(process.argv)

  if (!projectName) {
    console.error("Project name is required.")
    return
  }

  const opts = app.opts()

  await generate(projectName, opts.useNpm, opts.online, opts.template)
}

init()
