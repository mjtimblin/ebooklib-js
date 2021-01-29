"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lodash = require("lodash");

/**
 * Finds nodes and its child nodes recursively based on a given discriminator function
 *
 * @param {Array.<object>} nodes JS objects to search recursively through
 * @param {function} discriminatorFunction Function to determine if the node should be returned in the found list
 *
 * @returns {Array.<object>} The nodes matching the search criteria
 */
function findNodesRecursively(nodes, discriminatorFunction) {
  var foundNodes = [];
  nodes.forEach(function (node) {
    if (discriminatorFunction(node)) {
      foundNodes.push(node);
    }

    var childNodes = (0, _lodash.get)(node, 'elements', []);
    foundNodes = foundNodes.concat(findNodesRecursively(childNodes, discriminatorFunction));
  });
  return foundNodes;
}

var _default = findNodesRecursively;
exports["default"] = _default;