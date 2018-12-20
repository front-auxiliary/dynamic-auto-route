"use strict";
const fs = require('fs');
const nodePath = require('path');
//windows平台
var isWin = /^win/.test(process.platform);

var FileRoute=function(){
    this.options={}
} 

//参数设置
FileRoute.prototype.setOptions=function(options){
    this.options=options;
}

//获取所需路径数组
FileRoute.prototype.getDirs=function(dir){
    var file=[];
    var stats = fs.statSync(dir);
    //node里面的也有_this不要用_this
    var that=this;
    if (stats.isDirectory()) {
       var newDir=fs.readdirSync(dir,{encoding:'utf8'});
       newDir.map(function(item){
          var dirFile=that.getDirs(nodePath.resolve(dir, item));
          file=file.concat(dirFile);
       })
        return file
    } else {
        var okUrl=this.urlFormat(dir);
        return okUrl?[okUrl]:[];
    }
}

//判断是否符合规则
FileRoute.prototype.isFilterSuffix=function(url){
    var filterSuffix = this.options.filterSuffix;
    var typeStr = Object.prototype.toString.call(filterSuffix)
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

//路径过滤
FileRoute.prototype.urlFormat=function(url){
    if(this.isFilterSuffix(url)){
        url=url.replace(/_/,':');
        if(isWin){
          url=url.replace(/\\/g,'/');    
        }
        return url;
    }
    return '';
}

//输出所需路由格式
FileRoute.prototype.setEveryRoute=function(url){
    var frontPath=url.replace(this.options.inPath+'/','');
    var jsPath=frontPath.replace('/index.js','').replace('index.js','').replace('.js','');
    var vuePath=jsPath.replace('/index.vue','').replace('index.vue','').replace('.vue','');
    var path=vuePath?vuePath:'/';
    var name=path.replace(/:/ig,'').replace(/\//ig,'-');
    var component=url;
    return "\n{\npath:'"+path+"',\nname:'"+name+"',\ncomponent:()=>import('"+component+"')\n},";
}

//渲染输出
FileRoute.prototype.render=function(){
    var getList=this.getDirs(this.options.inPath);
    var str='';
    var renderStr='';
    getList.map((item,index)=>{
        str+=this.setEveryRoute(item);
    })
    renderStr='export default {routes:['+str+']}';
    fs.writeFileSync(this.options.outPath+'/'+this.options.fileName,renderStr);
}

module.exports=FileRoute;