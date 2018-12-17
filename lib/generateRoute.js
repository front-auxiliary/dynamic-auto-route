"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var fs = require('fs');

var nodePath = require('path'); //模版文件


var isWin = /^win/.test(process.platform);

function _getFilesPromisify(dir) {
  var stats = fs.statSync(dir);

  if (stats.isDirectory()) {
    return readdirPromisify(dir).then(function (list) {
      return Promise.all(list.map(function (item) {
        return _getFilesPromisify(nodePath.resolve(dir, item));
      }));
    }).then(function (subtree) {
      var _ref;

      return (_ref = []).concat.apply(_ref, _toConsumableArray(subtree));
    });
  } else {
    return [dir];
  }
}

var generateRoute =
/*#__PURE__*/
function () {
  function generateRoute(params) {
    _classCallCheck(this, generateRoute);
  }

  _createClass(generateRoute, [{
    key: "render",
    value: function render(params) {
      var _this = this;

      this.getFilesPromisify(params.inPath).then(function (filesList) {
        var filterSuffixArr = params.filterSuffix.split(',');
        var renderRoute = [];

        for (var i = 0; i < filesList.length; i++) {
          //过滤生成的文件
          filterSuffixArr.map(function (item, index) {
            var isFilterSuffix = filesList[i].indexOf(item);

            if (isFilterSuffix != -1) {
              renderRoute = renderRoute.concat(_this.formatOptimize(filesList[i], params));
            }
          });
        }

        var strs = 'export default {routes:[' + renderRoute + ']}';

        _this.writeFile(params.outPath + '/' + params.fileName, strs);
      });
    }
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
    }
  }, {
    key: "formatOptimize",
    value: function formatOptimize() {
      var result = "\n{\npath:'${path}',\nname:'${name}',\ncomponent:()=>import('${component}')\n}";
      var newRou = [];
      var pathReg = new RegExp('\\$\\{path\\}', 'ig');
      var nameReg = new RegExp('\\$\\{name\\}', 'ig');
      var componentReg = new RegExp('\\$\\{component\\}', 'ig');
      var pageNext = param.split(this.pathResolve(params.srcDir))[1]; //动态路由

      var switchSrc = pageNext.replace(/_/g, ':');
      var firstItem = switchSrc.split('.')[0].split('/');

      if (isWin) {
        firstItem = switchSrc.split('.')[0].split(/\\/g);
      }

      var endPath = firstItem[firstItem.length - 1];
      var thirdItem = firstItem;

      if (endPath == 'index') {
        thirdItem = firstItem.slice(0, firstItem.length - 1);
      }

      var nameStr = '';
      var pathStr = ''; //循环拼接

      thirdItem.map(function (item, index) {
        var renderName = item.replace(/:/g, '');
        nameStr = nameStr ? nameStr + '-' + renderName : renderName;
        pathStr = pathStr ? pathStr + '/' + item : item;
      });
      nameStr = nameStr ? nameStr : endPath;

      if (isWin) {
        pathStr = pathStr.replace(/\\/g, '/');
        nameStr = nameStr.replace(/\\/g, '-');
        param = param.replace(/\\/g, '/');
      }

      result = result.replace(pathReg, '/' + pathStr);
      result = result.replace(nameReg, nameStr);
      result = result.replace(componentReg, param);
      newRou.push(result);
      return newRou;
    }
  }, {
    key: "getFilesPromisify",
    value: function getFilesPromisify(dir) {
      var stats = fs.statSync(dir);

      if (stats.isDirectory()) {
        return this.readdirPromisify(dir).then(function (list) {
          return Promise.all(list.map(function (item) {
            return _getFilesPromisify(nodePath.resolve(dir, item));
          }));
        }).then(function (subtree) {
          var _ref2;

          return (_ref2 = []).concat.apply(_ref2, _toConsumableArray(subtree));
        });
      } else {
        return [dir];
      }
    }
  }]);

  return generateRoute;
}();

module.exports = generateRoute;