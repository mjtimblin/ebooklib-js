import { get, set } from 'lodash';
import EpubHtml from './EpubHtml';
import convertXmlStringToJS from './utils/convertXmlStringToJS';
import convertJsObjectToXML from './utils/convertJsObjectToXML';
import TemplateTypeEnum from './enum/TemplateTypeEnum';
import findNodesRecursively from './utils/findNodesRecursively';

/**
 * Class that represents the cover document for the EPUB file.
 *
 * @class
 * @augments EpubHtml
 */
class EpubCoverHtml extends EpubHtml {
	constructor(
		uid = 'cover',
		fileName = 'cover.xhtml',
		imageName = '',
		title = 'Cover',
	) {
		super(uid, fileName, '', null, title);

		this.imageName = imageName;
		this.isLinear = false;
	}

	/**
	 * Returns if this document is a chapter or not.
	 * The epub cover is never a chapter, so this will always return false.
	 *
	 * @returns {boolean}  Returns true if this document is a chapter
	 */
	static isChapter() {
		return false;
	}

	/**
	 * Gets content for the cover page as a string.
	 *
	 * @returns {string}  The HTML content of this document
	 */
	getContent() {
		this.content = this.book.getTemplate(TemplateTypeEnum.COVER);

		const tree = convertXmlStringToJS(super.getContent());
		const imageNodes = findNodesRecursively(
			get(tree, 'elements', []),
			(node) => node.name === 'xhtml:img' || node.name === 'img',
		);

		if (imageNodes.length > 0) {
			set(imageNodes[0].attributes, 'src', this.imageName);
			set(imageNodes[0].attributes, 'alt', this.title);
		}

		return convertJsObjectToXML(tree);
	}
}

EpubCoverHtml.prototype.toString = () =>
	`<EpubCoverHtml:${this.id}:${this.fileName}>`;

export default EpubCoverHtml;
