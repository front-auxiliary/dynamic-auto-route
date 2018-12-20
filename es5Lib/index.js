
"use strict";

const render = require('./generateRoute');
const chokidar = require('chokidar');
const path = require('path');
const env = process.env.NODE_ENV;
var generateRoute=new render();

var FileListPlugin=function(options){
    this.defaultParams={};
    this.newParams=options;
}

//新旧参数对比
FileListPlugin.prototype.compareParams=function(newParams,oldParams) {
  var typeStr =Object.prototype.toString.call(newParams);
  var params=typeStr==='[object Object]'?newParams:{};
  for(let item in oldParams){
      if(!params[item]){
        params[item]=oldParams[item];
      }
   }
   return params;
}

//监听调用
FileListPlugin.prototype.monitorRoute=function(params){
    generateRoute.setOptions(params);
    generateRoute.render();
  if(env === 'production'){
      return ;
  }
  const templateFile = chokidar.watch(params.inPath);
  //文件变动监听(增加、删除文件夹，增加、删除文件，文件内容发生变化)
  templateFile.on('ready', () => {
      templateFile.on('add', (path) => {
        generateRoute.render();
      });
      templateFile.on('unlink', (path) => {
        generateRoute.render();
      });
      templateFile.on('addDir', (path) => {
        generateRoute.render();
      });
      templateFile.on('unlinkDir', (path) => {
        generateRoute.render();
      });
      templateFile.on('change', (path) => {
        generateRoute.render();
      });
  })
}

//插件
FileListPlugin.prototype.apply = function (compiler) {
  this.defaultParams={
    fileName:'newRouter.js',
    inPath:path.resolve(compiler.options.context,'./src/pages'),
    outPath:path.resolve(compiler.options.context,'./src/router'),
    filterSuffix:'.vue'
  }
  var params=this.compareParams(this.newParams,this.defaultParams);
  this.monitorRoute(params);
}

module.exports = FileListPlugin;
  

 