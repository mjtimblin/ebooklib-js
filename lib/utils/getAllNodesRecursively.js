"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var _require = require('jsdom'),
    JSDOM = _require.JSDOM;
/**
 * Traverses the document tree to return an array of all the nodes
 *
 * @param {JSDOM.Document} htmlDocument  The html document
 *
 * @returns {Array.<JSDOM.Node>}  The array of nodes
 */


function getAllNodesRecursively(htmlDocument) {
  var allNodes = [];

  if (!htmlDocument.hasChildNodes()) {
    return [htmlDocument];
  }

  _toConsumableArray(htmlDocument.childNodes).forEach(function (childNode) {
    allNodes = allNodes.concat(getAllNodesRecursively(childNode));
  });

  return allNodes;
}

var _default = getAllNodesRecursively;
exports["default"] = _default;