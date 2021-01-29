const { JSDOM } = require('jsdom');

/**
 * Traverses the document tree to return an array of all the nodes
 *
 * @param {JSDOM.Document} htmlDocument  The html document
 *
 * @returns {Array.<JSDOM.Node>}  The array of nodes
 */
function getAllNodesRecursively(htmlDocument) {
	let allNodes = [];
	if (!htmlDocument.hasChildNodes()) {
		return [htmlDocument];
	}
	[...htmlDocument.childNodes].forEach((childNode) => {
		allNodes = allNodes.concat(getAllNodesRecursively(childNode));
	});
	return allNodes;
}

export default getAllNodesRecursively;
