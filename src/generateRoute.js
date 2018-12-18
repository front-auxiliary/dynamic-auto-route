const fs = require('fs')
const nodePath = require('path')
// 正则表达式
const isWin = /^win/.test(process.platform);
const pathReg = new RegExp('\\$\\{path\\}', 'ig');
const nameReg = new RegExp('\\$\\{name\\}', 'ig');
const componentReg = new RegExp('\\$\\{component\\}', 'ig');

class generateRoute {
  constructor(params) {
    this.parameter = {}
  }

  setData(params){
    this.parameter = Object.assign({},params)
  }

  render() {
    let params = Object.assign({},this.parameter);
    this.getFilesPromisify(params.inPath).then(filesList => {
      let renderRoute = [];
      for (var i = 0; i < filesList.length; i++) {
        //过滤生成的文件
        renderRoute = renderRoute.concat(this.formatOptimize(filesList[i]));
      }
      const strs = 'export default {routes:[' + renderRoute + ']}';
      this.writeFile(params.outPath + '/' + params.fileName, strs);
    })
  }
  //输出文件
  writeFile(fileName, data) {
    fs.writeFileSync(fileName, data, () => {
      console.log("文件生成成功");
    });
  }
  pathResolve(path) {
    return path
  }
  
  //对每一个路径进行处理
  formatOptimize(url) {
    const params = Object.assign({},this.parameter);
    let result = "\n{\npath:'${path}',\nname:'${name}',\ncomponent:()=>import('${component}')\n}";
    let newRou = [];
    if (isWin) {
      url = url.replace(/\\/g, '/');
    }
    let pageNext = url.split(this.pathResolve(params.srcDir))[1];
    //_下划线文件名替换成: 满足动态路由
    let switchSrc = pageNext.replace(/_/g, ':');
    // 去掉后缀名 并且 以 / 切割成数组
    let firstItem = switchSrc.split('.')[0].split('/');
    // 获取最后一个元素
    let endPath = firstItem[firstItem.length - 1];
    if (endPath == 'index') {
      firstItem = firstItem.slice(0, firstItem.length - 1);
    }
    let nameStr = '';
    let pathStr = '';

    //循环拼接
    firstItem.map((item, index) => {
      let renderName = item.replace(/:/g, '');
      nameStr = nameStr ? nameStr + '-' + renderName : renderName;
      pathStr = pathStr ? pathStr + '/' + item : item;
    })
    nameStr = nameStr ? nameStr : endPath;
    //模板替换
    result = result.replace(pathReg, '/' + pathStr)
    result = result.replace(nameReg, nameStr)
    result = result.replace(componentReg, url)
    newRou.push(result);
    return newRou
  }
  //读取文件目录
  readdirPromisify(dir) {
    return new Promise((resolve, reject) => {
      fs.readdir(dir, (err, list) => {
        if (err) {
          reject(err);
        }
        resolve(list);
      });
   
   });
  }
  //获取路径数组
  getFilesPromisify(dir) {
    let stats = fs.statSync(dir);
    if (stats.isDirectory()) {
      return this.readdirPromisify(dir).then(list =>
        Promise.all(list.map(item =>
          this.getFilesPromisify(nodePath.resolve(dir, item))
        ))
      ).then(subtree => [].concat(...subtree));
    } else {
      
      if(this.isFilterSuffix(dir)){
        return [dir];
      }
      return [];
    }
  }
  //判断是否符合规则
  isFilterSuffix(url){
    let filterSuffix = this.parameter.filterSuffix;
    let typeStr = Object.prototype.toString.call(filterSuffix)
    if(typeStr == '[object RegExp]'){
      if(filterSuffix.test(url)){
        return true;
      }
    }
    if(typeStr == '[object String]'){
      if(url.indexOf(filterSuffix) !=-1){
        return true;
      }
    }
    return false;
  }
}

module.exports = generateRoute;