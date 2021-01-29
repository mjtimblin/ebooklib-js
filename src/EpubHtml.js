import { set } from 'lodash';
import EpubItem from './EpubItem';
import ItemTypeEnum from './enum/ItemTypeEnum';
import convertXmlStringToJS from './utils/convertXmlStringToJS';
import convertJsObjectToXML from './utils/convertJsObjectToXML';
import addChild from './utils/addChild';
import TemplateTypeEnum from './enum/TemplateTypeEnum';
import findNodesRecursively from './utils/findNodesRecursively';

/**
 * Class that represents an HTML document in the EPUB file.
 *
 * @class
 * @augments EpubItem
 */
class EpubHtml extends EpubItem {
	constructor(
		uid = null,
		fileName = '',
		mediaType = '',
		content = null,
		title = '',
		lang = null,
		direction = null,
		mediaOverlay = null,
		mediaDuration = null,
	) {
		super(uid, fileName, mediaType, content);

		this.title = title;
		this.lang = lang;
		this.direction = direction;

		this.mediaOverlay = mediaOverlay;
		this.mediaDuration = mediaDuration;

		this.links = [];
		this.properties = [];
		this.pages = [];
	}

	/**
	 * Returns true if this document is a chapter and false if it is not
	 *
	 * @returns {boolean} The book value
	 */
	static isChapter() {
		return true;
	}

	/**
	 * Overrides EpubItem's getType method to always return DOCUMENT type
	 *
	 * @returns {ItemTypeEnum} The item's type
	 */
	static getType() {
		return ItemTypeEnum.DOCUMENT;
	}

	/**
	 * Sets the language for this book item. By default it will user the language of the book, but
	 * it can still be overwritten with this method.
	 *
	 * @param {string} lang  The new language code for this book item
	 */
	setLanguage(lang) {
		this.lang = lang;
	}

	/**
	 * Gets the language code for this book item. The language of the book item can be different from the
	 * language settings defined globally for the book.
	 *
	 * @returns {string}  The language code for this book item
	 */
	getLanguage() {
		return this.lang;
	}

	/**
	 * Adds an additional link to the document. Links will be embedded only inside of this document.
	 * NOTE: This link has an undefined structure and is not the same as the Link object in src/epub/Link.js
	 *
	 * @example <caption>Example usage of addLink.</caption>
	 * addLink({href='styles.css', rel='stylesheet', type='text/css'})
	 *
	 * @param {object} link The link to add to the document
	 */
	addLink(link) {
		this.links.push(link);

		if (
			Object.keys(link).includes('type') &&
			link.type === 'text/javascript' &&
			!this.properties.includes('scripted')
		) {
			this.properties.push('scripted');
		}
	}

	/**
	 * Returns the array of additional links defined for this document.
	 * NOTE: These links have an undefined structure and is not the same as the Link object in src/epub/Link.js
	 *
	 * @returns {Array.<object>} An array of links
	 *
	 */
	getLinks() {
		return this.links;
	}

	/**
	 * Returns an array of additional links defined for this document of the given type.
	 * NOTE: These links have an undefined structure and is not the same as the Link object in src/epub/Link.js
	 *
	 * @param {string} linkType  The type of the links to search for (e.g. 'text/javascript')
	 *
	 * @returns {Array.<object>} An array of links
	 *
	 */
	getLinksOfType(linkType) {
		return this.links.filter(
			(link) => Object.keys(link).includes('type') && link.type === linkType,
		);
	}

	/**
	 * Adds an EpubItem to this document. It will create additional links according to the item type.
	 *
	 * @param {EpubItem} item  The EpubItem to add to this document
	 */
	addItem(item) {
		switch (item.getType()) {
			case ItemTypeEnum.STYLE:
				this.addLink({
					href: item.getName(),
					rel: 'stylesheet',
					type: 'text/css',
				});
				break;
			case ItemTypeEnum.SCRIPT:
				this.addLink({
					src: item.getName(),
					type: 'text/javascript',
				});
				break;
			default:
		}
	}

	/**
	 * Gets the content of the Body element for this HTML document. Content will be of type string
	 *
	 * @returns {string}  The body content of this document
	 */
	getBodyContent() {
		try {
			const wrappedContent =
				this.content && this.content.includes('body')
					? this.content
					: `<div>${this.content || ''}</div>`;

			const content = convertXmlStringToJS(wrappedContent);
			const bodyNodes = findNodesRecursively(
				[content],
				(node) => node.name === 'body',
			);

			return bodyNodes.length > 0 ? bodyNodes[0] : content;
		} catch (error) {
			return '';
		}
	}

	/**
	 * Gets the content for this HTML document as a string.
	 *
	 * @returns {string} The content
	 */
	getContent() {
		try {
			const tree = convertXmlStringToJS(
				this.book.getTemplate(TemplateTypeEnum.CHAPTER),
			);

			const treeRoot = tree.elements[tree.elements.length - 1];
			set(treeRoot.attributes, 'lang', this.lang || this.book.language);
			set(treeRoot.attributes, 'xml:lang', this.lang || this.book.language);

			const headElement = {
				type: 'element',
				name: 'head',
				attributes: {},
				elements: [],
			};

			if (this.title !== '') {
				const titleElement = {
					type: 'element',
					name: 'title',
					attributes: {},
					elements: [
						{
							type: 'text',
							text: this.title,
						},
					],
				};
				addChild(headElement, titleElement);
			}

			Object.values(this.links).forEach((link) => {
				switch (link.type) {
					case 'text/javascript': {
						const scriptElement = {
							type: 'element',
							name: 'script',
							attributes: {},
							elements: [],
						};
						set(scriptElement.attributes, 'src', link.src);
						addChild(headElement, scriptElement);
						break;
					}
					case 'text/css': {
						const styleElement = {
							type: 'element',
							name: 'link',
							attributes: {},
							elements: [],
						};
						set(styleElement.attributes, 'rel', link.rel);
						set(styleElement.attributes, 'href', link.href);
						addChild(headElement, styleElement);
						break;
					}
					default:
				}
			});

			addChild(treeRoot, headElement);
			const bodyElement = {
				type: 'element',
				name: 'body',
				attributes: {},
				elements: [],
			};

			if (this.direction) {
				set(bodyElement.attributes, 'dir', this.direction);
				set(treeRoot.attributes, 'dir', this.direction);
			}

			const bodyContent = this.getBodyContent();

			if (bodyContent) {
				bodyContent.elements.forEach((node) => addChild(bodyElement, node));
			}

			addChild(treeRoot, bodyElement);
			tree.elements[tree.elements.length - 1] = treeRoot;

			return convertJsObjectToXML(tree);
		} catch (error) {
			return '';
		}
	}
}

EpubHtml.prototype.toString = () => `<EpubHtml:${this.id}:${this.fileName}>`;

export default EpubHtml;
