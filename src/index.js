
import path from 'path'
import fs from 'fs'
import fse from 'fs-extra'
import { promisify } from 'util'
import spawn from 'cross-spawn'

// wrap promisify
const readFile = promisify(fs.readFile)
const write = promisify(fs.writeFile)

// 基础模板路径
const localTemplateDirectory = path.join(__dirname, '../package')

const promiseSpawn = ({
  command = '',
  args = [],
  option = {},
}) => new Promise((resolve, reject) => {
  if (!command || args.length <= 0) {
    reject(new Error('参数不全，无法执行spawn命令...'))
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

const updatePKG = async (...args) => {
  const [
    basePath,
    projectName
  ] = args

  // default name & version & private
  const pkgPath = path.join(basePath, 'package.json')

  // update packagejson.name & packagejson.version & packagejson.private
  const raw = await readFile(pkgPath, 'utf-8')

  // parse
  const pkg = JSON.parse(raw)
  pkg.name = projectName
  pkg.version = '0.0.1'
  pkg.private = true

  await write(pkgPath,
  JSON.stringify(pkg, null, 2))
}

const createFromOnline = () => {}

const createFromBase = async (...args) => {
  const [
    projectName,
    basePath,
    useNPM
  ] = args

  // 现阶段 只有一个 template
  // 未来扩展，将通过 `config.json` 来自动化配置 version
  const rawPath = path.join(localTemplateDirectory, 'js')
  
  // check isexist
  if(!fs.existsSync(rawPath)) {
    console.error('无法找到基础模板，程序将自动退出！')
    process.exit(1)
    return
  }
  await fse.copy(rawPath, basePath)

  await updatePKG(basePath, projectName)
  

  // install ??
  if (useNPM) {
    await promiseSpawn({
      command: 'npm',
      args: [
        'install', 
        '--save',
      '--save-exact'
      ]
    })
    return
  }

  const root = path.resolve(projectName)

  await promiseSpawn({
    command: 'yarn',
    args: [
      "install",
      "--cwd",
      root
    ]
  })
}

const generate = async (...args) => {
  const [
    projectName,
    useNPM,
    online,
  ] = args

  // base path ?  Target project path
  // 项目所在路径  -->  统一命名 basePath
  const basePath = path.join(process.cwd(), projectName)

  // Determine whether the folder exists.
  // 判断文件夹是否存在？？
  const isExist = fs.existsSync(basePath)
  if(isExist) {
    // 存在 报错
    console.error('文件夹已存在！程序将自动退出！')
    process.exit(1)
    return
  }

  // create directory
  fs.mkdirSync(basePath)

  // online?
  // 模板从线上来？？
  if(online) {
    // online 是一个url
    // online is url
    await createFromOnline(projectName, basePath, online)
    return
  }

  await createFromBase(projectName, basePath, useNPM)

}


export default generate