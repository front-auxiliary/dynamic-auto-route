
const generateRoute = require('./generateRoute');
const chokidar = require('chokidar');
const path = require('path');
const env = process.env.NODE_ENV;
const autoRoute = new generateRoute();
class FileListPlugin {
  constructor(options) {
    this.newParams = options || {};

  }
  // 定义 `apply` 方法
  apply(compiler) {
    let defaultParams = {
      fileName: 'newRouter.js',
      inPath: path.resolve(compiler.options.context, './src/pages'),
      outPath: path.resolve(compiler.options.context, './src/router'),
      srcDir: 'pages',
      filterSuffix: '.vue'
    }
    let params = Object.assign(this.newParams, defaultParams);
    this.auto(params)
  }
  auto(params) {
    autoRoute.render(params)
    if (env === 'production') {
      return;
    }
    const templateFile = chokidar.watch(params.inPath);
    //文件变动监听(增加、删除文件夹，增加、删除文件，文件内容发生变化)
    templateFile.on('ready', () => {
      templateFile.on('add', (path) => {
        autoRoute.render(params);
      });
      templateFile.on('unlink', (path) => {
        autoRoute.render(params);
      });
      templateFile.on('addDir', (path) => {
        autoRoute.render(params);
      });
      templateFile.on('unlinkDir', (path) => {
        autoRoute.render(params);
      });
      templateFile.on('change', (path) => {
        autoRoute.render(params);
      });
    })

  }
}
module.exports = FileListPlugin;








