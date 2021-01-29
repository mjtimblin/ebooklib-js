"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

/**
 * Adds a node as a child of the parent node. This function mutates the parentNode
 *
 * @param {object} parentNode JS object that may or may not include elements key
 * @param {object} childNode JS object to add to push to parentNode's children
 */
function addChild(parentNode, childNode) {
  if (!Object.prototype.hasOwnProperty.call(parentNode, 'elements')) {
    // eslint-disable-next-line no-param-reassign
    parentNode.elements = [];
  }

  parentNode.elements.push(childNode);
}

var _default = addChild;
exports["default"] = _default;