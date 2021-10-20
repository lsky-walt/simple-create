import fs from 'fs'
import chalk from 'chalk'
import path from 'path'
import os from 'os'

const base = path.join('~/')

// config key
const keys = ['NPM', 'DEFAULT_TEMPLATE', 'ASSET_URL']

const parse = (string = '') => {
  const config = {}
  if(!string) {
    return config
  }
  const arr = string.trim().split(os.EOL).filter(v => {
    // 剔除注释  # 开头
    if(v.trim().startsWith('#')) {
      return false
    }
    // 剔除 不是 key=value 的格式
    return v.indexOf('=') > -1
  }).map(v => {
    // key=value
    return v.split('=')
  })
  
  arr.forEach(keyValue => {
    const [key, value] = keyValue
    if(keys.includes(key)) {
      if(value === 'true') {
        config[key] = true
      }else if(value === 'false') {
        config[key] = false
      } else {
        config[key] = value
      }
    }
  });

  return config
}

const getLocalConfig = () => {
  const target = path.join(base, '.cmoney')
  if(!fs.existsSync(target)) {
    console.log(`不存在本地配置文件 ${chalk.cyan('.cmoney')}。`)
    console.log()
    return {
      "NPM": false,
      "DEFAULT_TEMPLATE": 'react',
      "ASSET_URL": ''
    }
  }
  const raw = fs.readFileSync(target, 'utf-8')
  return parse(raw)
}


const getConfig = (config = {}, key, value) => {
  if (value === false || value === undefined) {
    return config[key]
  }
  return value
}

export {
  getLocalConfig,
  getConfig
}