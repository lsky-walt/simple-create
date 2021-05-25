
import path from 'path'
import fs from 'fs'
import fse from 'fs-extra'
import { promisify } from 'util'
import { promiseSpawn, 
  info, warn, error, success, 
  stressInfo, stressWarn, stressError, stressSuccess } from './tool'

// wrap promisify
const readFile = promisify(fs.readFile)
const write = promisify(fs.writeFile)



// 就是一个工具 
// 用来拉去模板  生成模板项目   执行install  
// 基础 template：git@github.com:lsky-walt/template.git

const asset = "git@github.com:lsky-walt/template.git"

const rightArrow = '\u27A4 \u27A4 \u27A4'

// 基础模板路径
const localTemplateDirectory = path.join(__dirname, '../package')

const checkURL = (url) => {
  if(!url || typeof url !== 'string') return false
  return true
}

const checkURLIsGit = (url) => {
  if(url.startsWith('git@') || (
    url.startsWith('http') && url.endsWith('.git')
  )) {
    return true
  }

  return false
}

const checkURLIsCurl = (url) => {
  if(url.startsWith('http') && url.endsWith('.zip')) return true
  return false
}


const resetOnline = (p) => {
  if(!p) return
  if(fs.existsSync(p)) {
    fse.removeSync(p)
  }
}


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

const install = async (projectName, useNPM) => {
  const root = path.resolve(projectName)

  // install ??
  if (useNPM) {
    console.log(`Use ${warn('Npm')}.`)
    console.log()
    await promiseSpawn({
      command: 'npm',
      args: [
        'install', 
        '--save',
      '--save-exact',
      '--prefix',
      root
      ]
    })
    return
  }

  console.log(`Use ${warn('Yarn')}.`)
  console.log()
  await promiseSpawn({
    command: 'yarn',
    args: [
      "install",
      "--cwd",
      root
    ]
  })
}


// clone template from online
/**
 *  要求： template 
 * - package/
 *    - version.json
 *    - source/
 **/ 
const createFromOnline = async (...args) => {
  const [projectName, basePath, online, useNPM] = args

  if(!checkURL(online)) {
    console.log(`\u27A4 ${error('参数仅允许为url！')}`)
    process.exit(1)
    return false
  }


  const t = path.join(localTemplateDirectory, 'from-online')


  // download assets
  // 判断使用 git  还是 curl

  // 使用 git
  // 如果 git@ 开头
  // 如果是 http 开头，.git 结尾
  if(checkURLIsGit(online)) {

    console.log(`使用 ${warn('git')} 下载模板，下载地址：${warn(online)}。`)
    console.log()

    resetOnline(t)

    await promiseSpawn({
      command: 'git',
      args: [
        'clone',
        online,
        t
      ]
    })
  }

  // 否则用 curl  并且 .zip 结尾
  if(checkURLIsCurl(online)) {
    

    // get filename
    const s = online.split('/')
    const filename = s[s.length - 1]

    resetOnline(t)

    fs.mkdirSync(t)

    console.log(`使用 ${warn('curl')} 下载模板，下载地址：${warn(online)}。`)
    console.log()

    await promiseSpawn({
      command: 'curl',
      args: [
        '-O',
        online
      ],
      option: {
        cwd: t
      }
    })

    // 下载完 解压
    await promiseSpawn({
      command: 'unzip',
      args: [filename]
    })
  }

  // 不符合全部报错
  if(!fs.existsSync(t)) {
    console.log(stressError(`线上下载模板失败！！请检查地址。`))
    process.exit(1)
    return
  }

  console.log(`拷贝中...`)
  console.log()
  
  await fse.copy(path.join(t, 'source'), basePath)

  await updatePKG(basePath, projectName)

  console.log(info(`${rightArrow} Install package.json.`))
  console.log()
  await install(projectName, useNPM)


  console.log('正在执行清扫任务...')
  console.log()
  // 清扫
  fse.removeSync(t)
}


// clone template from local
const createFromBase = async (...args) => {
  const [
    projectName,
    basePath,
    useNPM,
    template
  ] = args

  if(!fs.existsSync(localTemplateDirectory)) {
    fs.mkdirSync(localTemplateDirectory)
  }

  const tem = path.join(localTemplateDirectory, 'template')
  // check template
  if(!fs.existsSync(tem)) {
    console.log(`本地不存在模板库，将从云拉去。`)
    await promiseSpawn({
      command: "git",
      args: [
        'clone',
        asset,
        tem
      ]
    })
    console.log()
  }

  console.log(`use { ${warn(template)} }.`)
  console.log()
  const rawPath = path.join(tem, 'packages', template)
  
  // check isexist
  if(!fs.existsSync(rawPath)) {
    console.log(stressError('无法找到基础模板，程序将自动退出！'))
    process.exit(1)
    return
  }

  // 执行创建
  console.log(info(`${rightArrow} Create project.`))
  console.log()
  await fse.copy(rawPath, basePath)

  await updatePKG(basePath, projectName)
  

  console.log(info(`${rightArrow} Install package.json.`))
  console.log()
  await install(projectName, useNPM)
}

/**
 * @param projectName
 * @param useNPM 
 * @param online ?
 * @param template, target template, default react. if use online, this attr will abandom.
 */
const generate = async (...args) => {
  const [
    projectName,
    useNPM,
    online,
    template,
  ] = args

  // base path ?  Target project path
  // 项目所在路径  -->  统一命名 basePath
  const basePath = path.join(process.cwd(), projectName)

  console.log(`Project name ${rightArrow} ${info(projectName)}.`)
  console.log()

  // Determine whether the folder exists.
  // 判断文件夹是否存在？？
  const isExist = fs.existsSync(basePath)
  if(isExist) {
    // 存在 报错
    console.log(stressError('文件夹已存在！程序将自动退出！'))
    process.exit(1)
    return
  }

  // create directory
  fs.mkdirSync(basePath)

  // online?
  // 模板从线上来？？
  if(online && typeof online === 'string') {
    // online 是一个url
    // online is url
    console.log(`Use ${stressWarn('\u007B online \u007D')} asset: ${info(online)}.`)
    console.log()

    await createFromOnline(projectName, basePath, online, useNPM)

    console.log(`\u2714 ${stressSuccess('Create project completed, goodbye')}.`)
    process.exit(1)
    return
  }

  console.log(`Use ${stressWarn('\u007B local \u007D')} asset.`)
  console.log()
  await createFromBase(projectName, basePath, useNPM, template)

  console.log()
  console.log(`\u2714 ${stressSuccess('Create project completed, goodbye')}.`)
  process.exit(1)
}


export default generate