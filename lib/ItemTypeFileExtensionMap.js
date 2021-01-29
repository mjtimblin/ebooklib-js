"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _ItemTypeEnum = _interopRequireDefault(require("./enum/ItemTypeEnum"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var ItemTypeFileExtensionMap = [];
ItemTypeFileExtensionMap[_ItemTypeEnum["default"].UNKNOWN] = [];
ItemTypeFileExtensionMap[_ItemTypeEnum["default"].IMAGE] = ['jpg', 'jpeg', 'gif', 'tiff', 'tif', 'png'];
ItemTypeFileExtensionMap[_ItemTypeEnum["default"].STYLE] = ['css'];
ItemTypeFileExtensionMap[_ItemTypeEnum["default"].SCRIPT] = ['js'];
ItemTypeFileExtensionMap[_ItemTypeEnum["default"].NAVIGATION] = ['ncx'];
ItemTypeFileExtensionMap[_ItemTypeEnum["default"].VECTOR] = ['svg'];
ItemTypeFileExtensionMap[_ItemTypeEnum["default"].FONT] = ['otf', 'woff', 'ttf'];
ItemTypeFileExtensionMap[_ItemTypeEnum["default"].VIDEO] = ['mov', 'mp4', 'avi'];
ItemTypeFileExtensionMap[_ItemTypeEnum["default"].AUDIO] = ['mp3', 'ogg'];
ItemTypeFileExtensionMap[_ItemTypeEnum["default"].DOCUMENT] = [];
ItemTypeFileExtensionMap[_ItemTypeEnum["default"].COVER] = ['jpg', 'jpeg', 'png'];
ItemTypeFileExtensionMap[_ItemTypeEnum["default"].SMIL] = ['smil'];
var _default = ItemTypeFileExtensionMap;
exports["default"] = _default;