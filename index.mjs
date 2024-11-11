import { execSync } from 'child_process'
import fs from 'fs'

/** 输出文件路径 */
const OUTPUT_PATH = 'tree.txt'

/** 目录注释 */
const pathCommentMap = {
  'src/router': '路由定义',
  'src/pages': '页面',
  'src/components': '全局组件',
}


const installDependence = () => {
  execSync('Install-Module PSTree -Scope CurrentUser', {'shell':'powershell.exe'})
}
const makeDirtree = () => {
  execSync(`Get-PSTree -Directory -Exclude *dist, *dist-template, *dist-electron, *.vscode, *node_modules -Recurse | Out-File -FilePath tree.txt -Encoding UTF8`, {
    'shell':'powershell.exe',
  })
}

try {
  makeDirtree()
} catch (error) {
  installDependence()
  makeDirtree()
}

const treeContent = fs.readFileSync(OUTPUT_PATH).toString()
// 过滤出目录相关的行
const treeLineList = treeContent.split('\r\n').filter(line => line.startsWith('d----'))
// 每一行提取出目录信息
const formatTreeLine = treeLineList.slice(1).map(line => line.trim().replace(/(.*)B (.*)([\u4e00-\u9fa5a-zA-Z]*)/, '$2$3'))
// 当前路径
let currentPathList = []
let resultContent = 'frontend\n'
for(let i = 0; i < formatTreeLine.length; i++) {
  const line = formatTreeLine[i]
  const currentDir = line.split(' ').at(-1)
  const lineSpaceCount = line.split('').filter(i => i === ' ').length - 1
  const depth = Math.floor(lineSpaceCount / 3)
  // 进入下一级
  if(depth > currentPathList.length) {
    currentPathList.push(currentDir)
  }
  else {
    currentPathList = currentPathList.slice(0, depth + 1)
    currentPathList[depth] = currentDir
  }
  // 得到当前路径
  const currentPath = currentPathList.join('/')
  const comment = pathCommentMap[currentPath] || ''
  resultContent += line + (comment ? ` // ${comment}` : '')
  resultContent += '\n'
}
fs.writeFileSync(OUTPUT_PATH, resultContent)
