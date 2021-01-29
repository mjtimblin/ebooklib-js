"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _constants = require("../constants");

var xmlJs = require('xml-js');
/**
 * Converts an XML string to a JS object
 *
 * @param {string} xmlString The XML string to convert
 *
 * @returns {xmlJs.Element} The JS object representation of the XML string
 */


function convertXmlStringToJS(xmlString) {
  return xmlJs.xml2js(xmlString, _constants.XML_JS_OPTIONS);
}

var _default = convertXmlStringToJS;
exports["default"] = _default;