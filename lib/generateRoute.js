"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var fs = require('fs');

var nodePath = require('path'); // 正则表达式


var isWin = /^win/.test(process.platform);
var pathReg = new RegExp('\\$\\{path\\}', 'ig');
var nameReg = new RegExp('\\$\\{name\\}', 'ig');
var componentReg = new RegExp('\\$\\{component\\}', 'ig');

var generateRoute =
/*#__PURE__*/
function () {
  function generateRoute(params) {
    _classCallCheck(this, generateRoute);

    this.parameter = {};
  }

  _createClass(generateRoute, [{
    key: "setData",
    value: function setData(params) {
      this.parameter = Object.assign({}, params);
    }
  }, {
    key: "render",
    value: function render() {
      var _this = this;

      var params = Object.assign({}, this.parameter);
      this.getFilesPromisify(params.inPath).then(function (filesList) {
        var renderRoute = [];

        for (var i = 0; i < filesList.length; i++) {
          //过滤生成的文件
          renderRoute = renderRoute.concat(_this.formatOptimize(filesList[i]));
        }

        var strs = 'export default {routes:[' + renderRoute + ']}';

        _this.writeFile(params.outPath + '/' + params.fileName, strs);
      });
    } //输出文件

  }, {
    key: "writeFile",
    value: function writeFile(fileName, data) {
      fs.writeFileSync(fileName, data, function () {
        console.log("文件生成成功");
      });
    }
  }, {
    key: "pathResolve",
    value: function pathResolve(path) {
      return path;
    } //对每一个路径进行处理

  }, {
    key: "formatOptimize",
    value: function formatOptimize(url) {
      var params = Object.assign({}, this.parameter);
      var result = "\n{\npath:'${path}',\nname:'${name}',\ncomponent:()=>import('${component}')\n}";
      var newRou = [];

      if (isWin) {
        url = url.replace(/\\/g, '/');
      }

      var pageNext = url.split(this.pathResolve(params.srcDir))[1]; //_下划线文件名替换成: 满足动态路由

      var switchSrc = pageNext.replace(/_/g, ':'); // 去掉后缀名 并且 以 / 切割成数组

      var firstItem = switchSrc.split('.')[0].split('/'); // 获取最后一个元素

      var endPath = firstItem[firstItem.length - 1];

      if (endPath == 'index') {
        firstItem = firstItem.slice(0, firstItem.length - 1);
      }

      var nameStr = '';
      var pathStr = ''; //循环拼接

      firstItem.map(function (item, index) {
        var renderName = item.replace(/:/g, '');
        nameStr = nameStr ? nameStr + '-' + renderName : renderName;
        pathStr = pathStr ? pathStr + '/' + item : item;
      });
      nameStr = nameStr ? nameStr : endPath; //模板替换

      result = result.replace(pathReg, '/' + pathStr);
      result = result.replace(nameReg, nameStr);
      result = result.replace(componentReg, url);
      newRou.push(result);
      return newRou;
    } //读取文件目录

  }, {
    key: "readdirPromisify",
    value: function readdirPromisify(dir) {
      return new Promise(function (resolve, reject) {
        fs.readdir(dir, function (err, list) {
          if (err) {
            reject(err);
          }

          resolve(list);
        });
      });
    } //获取路径数组

  }, {
    key: "getFilesPromisify",
    value: function getFilesPromisify(dir) {
      var _this2 = this;

      var stats = fs.statSync(dir);

      if (stats.isDirectory()) {
        return this.readdirPromisify(dir).then(function (list) {
          return Promise.all(list.map(function (item) {
            return _this2.getFilesPromisify(nodePath.resolve(dir, item));
          }));
        }).then(function (subtree) {
          var _ref;

          return (_ref = []).concat.apply(_ref, _toConsumableArray(subtree));
        });
      } else {
        if (this.isFilterSuffix(dir)) {
          return [dir];
        }

        return [];
      }
    } //判断是否符合规则

  }, {
    key: "isFilterSuffix",
    value: function isFilterSuffix(url) {
      var filterSuffix = this.parameter.filterSuffix;
      var typeStr = Object.prototype.toString.call(filterSuffix);

      if (typeStr == '[object RegExp]') {
        if (filterSuffix.test(url)) {
          return true;
        }
      }

      if (typeStr == '[object String]') {
        if (url.indexOf(filterSuffix) != -1) {
          return true;
        }
      }

      return false;
    }
  }]);

  return generateRoute;
}();

module.exports = generateRoute;