"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var generateRoute = require('./generateRoute');

var chokidar = require('chokidar');

var path = require('path');

var env = process.env.NODE_ENV;
var autoRoute = new generateRoute();

var FileListPlugin =
/*#__PURE__*/
function () {
  function FileListPlugin(options) {
    _classCallCheck(this, FileListPlugin);

    this.newParams = options || {};
  } // 定义 `apply` 方法


  _createClass(FileListPlugin, [{
    key: "apply",
    value: function apply(compiler) {
      var defaultParams = {
        fileName: 'newRouter.js',
        inPath: path.resolve(compiler.options.context, './src/pages'),
        outPath: path.resolve(compiler.options.context, './src/router'),
        srcDir: 'pages',
        filterSuffix: '.vue'
      };
      var params = Object.assign(this.newParams, defaultParams);
      autoRoute.setData(params);
      this.auto(params);
    }
  }, {
    key: "auto",
    value: function auto(params) {
      autoRoute.render();

      if (env === 'production') {
        return;
      }

      var templateFile = chokidar.watch(params.inPath); //文件变动监听(增加、删除文件夹，增加、删除文件，文件内容发生变化)

      templateFile.on('ready', function () {
        templateFile.on('add', function (path) {
          autoRoute.render();
        });
        templateFile.on('unlink', function (path) {
          autoRoute.render();
        });
        templateFile.on('addDir', function (path) {
          autoRoute.render();
        });
        templateFile.on('unlinkDir', function (path) {
          autoRoute.render();
        });
        templateFile.on('change', function (path) {
          autoRoute.render();
        });
      });
    }
  }]);

  return FileListPlugin;
}();

module.exports = FileListPlugin;