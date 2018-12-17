const fs = require('fs')
const nodePath = require('path')
//模版文件
const isWin = /^win/.test(process.platform);
class generateRoute {
  constructor(params) {

  }
  render(params) {

    this.getFilesPromisify(params.inPath).then(filesList => {
      let filterSuffixArr = params.filterSuffix.split(',');
      let renderRoute = [];
      for (var i = 0; i < filesList.length; i++) {
        //过滤生成的文件
        filterSuffixArr.map((item, index) => {
          let isFilterSuffix = filesList[i].indexOf(item);
          if (isFilterSuffix != -1) {
            renderRoute = renderRoute.concat(this.formatOptimize(filesList[i], params));
          }
        })
      }
      const strs = 'export default {routes:[' + renderRoute + ']}';
      this.writeFile(params.outPath + '/' + params.fileName, strs);
    })
  }
  writeFile(fileName, data) {
    fs.writeFileSync(fileName, data, () => {
      console.log("文件生成成功");
    });
  }
  pathResolve(path) {
    return path
  }
  formatOptimize(param,params) {
    let result = "\n{\npath:'${path}',\nname:'${name}',\ncomponent:()=>import('${component}')\n}";
    let newRou = [];
    let pathReg = new RegExp('\\$\\{path\\}', 'ig');
    let nameReg = new RegExp('\\$\\{name\\}', 'ig');
    let componentReg = new RegExp('\\$\\{component\\}', 'ig');
    let pageNext = param.split(this.pathResolve(params.srcDir))[1];
    //动态路由
    let switchSrc = pageNext.replace(/_/g, ':');
    let firstItem = switchSrc.split('.')[0].split('/');
    if (isWin) {
      firstItem = switchSrc.split('.')[0].split(/\\/g);
    }
    let endPath = firstItem[firstItem.length - 1];
    let thirdItem = firstItem;
    if (endPath == 'index') {
      thirdItem = firstItem.slice(0, firstItem.length - 1);
    }
    let nameStr = '';
    let pathStr = '';

    //循环拼接
    thirdItem.map((item, index) => {
      let renderName = item.replace(/:/g, '');
      nameStr = nameStr ? nameStr + '-' + renderName : renderName;
      pathStr = pathStr ? pathStr + '/' + item : item;
    })
    nameStr = nameStr ? nameStr : endPath;


    if (isWin) {
      pathStr = pathStr.replace(/\\/g, '/')
      nameStr = nameStr.replace(/\\/g, '-')
      param = param.replace(/\\/g, '/')
    }
    result = result.replace(pathReg, '/' + pathStr)
    result = result.replace(nameReg, nameStr)
    result = result.replace(componentReg, param)
    newRou.push(result);
    return newRou
  }
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
  getFilesPromisify(dir) {
    let stats = fs.statSync(dir);
    if (stats.isDirectory()) {
      return this.readdirPromisify(dir).then(list =>
        Promise.all(list.map(item =>
          this.getFilesPromisify(nodePath.resolve(dir, item))
        ))
      ).then(subtree => [].concat(...subtree));
    } else {
      return [dir];
    }
  }

}

module.exports = generateRoute