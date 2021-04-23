import path from 'path'

export const testFunc = () => {
  console.log('test rollup: ', path.join(__dirname, 'test'))
}