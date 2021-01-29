import { XML_JS_OPTIONS } from '../constants';

const xmlJs = require('xml-js');

/**
 * Converts a JS object to an XML string
 *
 * @param {xmlJs.Element} jsObj The JS object to convert
 *
 * @returns {string} The XML string representation of the JS object
 */
function convertJsObjectToXML(jsObj) {
	return xmlJs.js2xml(jsObj, XML_JS_OPTIONS);
}

export default convertJsObjectToXML;
