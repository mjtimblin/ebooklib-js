"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _constants = require("../constants");

var xmlJs = require('xml-js');
/**
 * Converts a JS object to an XML string
 *
 * @param {xmlJs.Element} jsObj The JS object to convert
 *
 * @returns {string} The XML string representation of the JS object
 */


function convertJsObjectToXML(jsObj) {
  return xmlJs.js2xml(jsObj, _constants.XML_JS_OPTIONS);
}

var _default = convertJsObjectToXML;
exports["default"] = _default;