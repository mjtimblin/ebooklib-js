import { XML_JS_OPTIONS } from '../constants';

const xmlJs = require('xml-js');

/**
 * Converts an XML string to a JS object
 *
 * @param {string} xmlString The XML string to convert
 *
 * @returns {xmlJs.Element} The JS object representation of the XML string
 */
function convertXmlStringToJS(xmlString) {
	return xmlJs.xml2js(xmlString, XML_JS_OPTIONS);
}

export default convertXmlStringToJS;
