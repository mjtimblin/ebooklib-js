import { get } from 'lodash';

/**
 * Finds nodes and its child nodes recursively based on a given discriminator function
 *
 * @param {Array.<object>} nodes JS objects to search recursively through
 * @param {function} discriminatorFunction Function to determine if the node should be returned in the found list
 *
 * @returns {Array.<object>} The nodes matching the search criteria
 */
function findNodesRecursively(nodes, discriminatorFunction) {
	let foundNodes = [];

	nodes.forEach((node) => {
		if (discriminatorFunction(node)) {
			foundNodes.push(node);
		}

		const childNodes = get(node, 'elements', []);
		foundNodes = foundNodes.concat(
			findNodesRecursively(childNodes, discriminatorFunction),
		);
	});

	return foundNodes;
}

export default findNodesRecursively;
