import { get, cloneDeep } from 'lodash';
import {
	NCX_XML,
	NAV_XML,
	CHAPTER_XML,
	COVER_XML,
	VERSION,
	NAMESPACES,
	BOOK_IDENTIFIER_ID,
} from './constants';
import uuidv4 from './utils/uuidv4';
import DirectionEnum from './enum/DirectionEnum';
import EpubCover from './EpubCover';
import EpubCoverHtml from './EpubCoverHtml';
import EpubHtml from './EpubHtml';
import EpubItem from './EpubItem';
import EpubImage from './EpubImage';
import ItemTypeEnum from './enum/ItemTypeEnum';
import TemplateTypeEnum from './enum/TemplateTypeEnum';

const mimeTypes = require('mime-types');

/**
 * Class that represents EPUB book data.
 *
 * @class
 */
class EpubBook {
	constructor() {
		this.EPUB_VERSION = null;
		this.reset();
	}

	/**
	 * Initialized all needed variables to default values
	 */
	reset() {
		this.metadata = {};
		this.items = [];
		this.spine = [];
		this.guide = [];
		this.pages = [];
		this.toc = [];
		this.bindings = [];

		this.htmlItemsCount = 0;
		this.imageItemsCount = 0;
		this.staticItemsCount = 0;

		this.title = '';
		this.language = 'en';
		this.direction = null;

		this.templates = [];
		this.templates[TemplateTypeEnum.NCX] = NCX_XML;
		this.templates[TemplateTypeEnum.NAV] = NAV_XML;
		this.templates[TemplateTypeEnum.CHAPTER] = CHAPTER_XML;
		this.templates[TemplateTypeEnum.COVER] = COVER_XML;

		this.addMetadata('OPF', 'generator', '', {
			name: 'generator',
			content: `EbookLib-JS ${VERSION}`,
		});

		// Default to using a randomly-unique identifier
		this.uid = uuidv4();

		// Custom prefixes and namespaces to be set to the content.opf doc
		this.prefixes = [];
		this.namespaces = {};
	}

	/**
	 * Sets the unique identifier for this EPUB.
	 *
	 * @param {string} value The id of the book
	 */
	setIdentifier(value) {
		this.id = value;
		this.setUniqueMetadata('DC', 'identifier', this.id, {
			id: BOOK_IDENTIFIER_ID,
		});
	}

	/**
	 * Sets the title for this EPUB. You can set multiple titles.
	 *
	 * @param {string} value The new title
	 */
	setTitle(value) {
		this.title = value;
		this.addMetadata('DC', 'title', value);
	}

	/**
	 * Sets the language for this EPUB. You can set multiple languages. Specific items in the book
	 * can have different language settings.
	 *
	 * @param {string} value The new language code
	 */
	setLanguage(value) {
		this.language = value;
		this.addMetadata('DC', 'language', value);
	}

	/**
	 * Sets the direction for this EPUB.
	 *
	 * @param {DirectionEnum} value The new direction
	 */
	set direction(value) {
		switch (value) {
			case DirectionEnum.DEFAULT:
				this.direction = 'default';
				break;
			case DirectionEnum.LEFT_TO_RIGHT:
				this.direction = 'ltr';
				break;
			case DirectionEnum.RIGHT_TO_LEFT:
				this.direction = 'rtl';
				break;
			default:
		}
	}

	/**
	 * Sets the cover and creates the cover document if needed.
	 *
	 * @param {string} fileName The file name of the cover page
	 * @param {string} content Content for the cover page
	 * @param {boolean} createPage Should cover page be defined. Defined as bool value (optional). Defaults to true
	 */
	setCover(fileName, content, createPage = true) {
		const c0 = new EpubCover('cover-img', fileName);
		c0.setContent(content);
		this.addItem(c0);

		if (createPage) {
			const c1 = new EpubCoverHtml('cover', 'cover.xhtml', fileName);
			this.addItem(c1);
		}

		const attributes = {
			name: 'cover',
			content: 'cover-img',
		};
		this.addMetadata(null, 'meta', '', attributes);
	}

	/**
	 * Adds an author for this EPUB.
	 *
	 * @param {string} author               The name of the author
	 * @param {(string|null)} [fileAs=null] The normalized author name for sorting (or null to omit it)
	 * @param {(string|null)} [role=null]   The author's role (or null to omit it)
	 * @param {string} [uid="creator"]      The unique identifier of the author
	 */
	addAuthor(author, fileAs = null, role = null, uid = 'creator') {
		this.addMetadata('DC', 'creator', author, { id: uid });

		if (fileAs) {
			this.addMetadata(null, 'meta', fileAs, {
				refines: `#${uid}`,
				property: 'file-as',
				scheme: 'marc:relators',
			});
		}

		if (role) {
			this.addMetadata(null, 'meta', role, {
				refines: `#${uid}`,
				property: 'role',
				scheme: 'marc:relators',
			});
		}
	}

	/**
	 * Adds metadata
	 *
	 * @param {string} namespace TODO: Add description
	 * @param {string} name TODO: Add description
	 * @param {string} value TODO: Add description
	 * @param {object} others TODO: Add description
	 */
	addMetadata(namespace, name, value, others = null) {
		const lowercaseNamespace =
			namespace === null ? 'null' : namespace.toLowerCase();

		if (!Object.keys(this.metadata).includes(lowercaseNamespace)) {
			this.metadata[lowercaseNamespace] = {};
		}

		if (!Object.keys(this.metadata[lowercaseNamespace]).includes(name)) {
			this.metadata[lowercaseNamespace][name] = [];
		}

		const metadataObject = {};
		metadataObject[value] = others;

		this.metadata[lowercaseNamespace][name].push(metadataObject);
	}

	/**
	 * Retrieves metadata
	 *
	 * @param {string} namespace TODO: Add description
	 * @param {string} name TODO: Add description
	 *
	 * @returns {Array.<object>} TODO: Add description
	 */
	getMetadata(namespace, name) {
		const lowercaseNamespace =
			namespace !== null ? namespace.toLowerCase() : null;
		return get(this.metadata[lowercaseNamespace], name, []);
	}

	/**
	 * Adds metadata if metadata with this identifier does not already exist,
	 * otherwise update existing metadata.
	 *
	 * @param {string} namespace TODO: Add description
	 * @param {string} name TODO: Add description
	 * @param {string} value TODO: Add description
	 * @param {object} others TODO: Add description
	 */
	setUniqueMetadata(namespace, name, value, others = null) {
		const lowercaseNamespace =
			namespace !== null ? namespace.toLowerCase() : null;

		if (
			Object.keys(this.metadata).includes(lowercaseNamespace) &&
			Object.keys(this.metadata[lowercaseNamespace]).includes(name)
		) {
			this.metadata[lowercaseNamespace][name] = [{ value: others }];
		} else {
			this.addMetadata(lowercaseNamespace, name, value, others);
		}
	}

	/**
	 * Adds an additional item to the EPUB. If not defined, the media type and chapter id
	 * will be defined for the item.
	 *
	 * @param {EpubItem} item The item to add to the EPUB
	 */
	addItem(item) {
		if (item.mediaType === '') {
			// eslint-disable-next-line no-param-reassign
			item.mediaType =
				mimeTypes.lookup(item.fileName) || 'application/octet-stream';
		}

		if (!item.id) {
			if (item instanceof EpubHtml) {
				this.htmlItemsCount += 1;
				// eslint-disable-next-line no-param-reassign
				item.id = `chapter_${this.htmlItemsCount}`;
			} else if (item instanceof EpubImage) {
				this.imageItemsCount += 1;
				// eslint-disable-next-line no-param-reassign
				item.id = `image_${this.imageItemsCount}`;
			} else {
				this.staticItemsCount += 1;
				// eslint-disable-next-line no-param-reassign
				item.id = `static_${this.staticItemsCount}`;
			}
		}

		// eslint-disable-next-line no-param-reassign
		item.book = this;
		this.items.push(item);
	}

	/**
	 * Returns either the item for the defined UID or null if the item
	 * can't be found.
	 *
	 * @example <caption>Example usage of getItemWithId.</caption>
	 * // Returns the found item
	 * book.getItemWithId('image_001')
	 *
	 * @param {string} uid Item id to search for
	 *
	 * @returns {(EpubItem|null)} The found item or null if the item can't be found
	 */
	getItemWithId(uid) {
		return this.getItems().find((item) => item.id === uid) || null;
	}

	/**
	 * Returns either the item for the defined href or null if the item
	 * can't be found.
	 *
	 * @example <caption>Example usage of getItemWithHref.</caption>
	 * // Returns the found item
	 * book.getItemWithHref('EPUB/document.xhtml')
	 *
	 * @param {string} href HREF for the item to search for
	 *
	 * @returns {(EpubItem|null)} The found item or null if the item can't be found
	 */
	getItemWithHref(href) {
		return this.getItems().find((item) => item.getName() === href) || null;
	}

	/**
	 * Returns all the items that are attached to this EPUB.
	 *
	 * @example <caption>Example usage of getItems.</caption>
	 * // Returns the list of items
	 * book.getItems()
	 *
	 * @returns {Array.<EpubItem>} The array of items
	 */
	getItems() {
		return this.items;
	}

	/**
	 * Returns all the items of the given item type that are attached to this EPUB.
	 *
	 * @example <caption>Example usage of getItemsOfType.</caption>
	 * // Returns the list of items
	 * book.getItemsOfType(ItemTypeEnum.IMAGE)
	 *
	 * @param {ItemTypeEnum} itemType Item type of the item to search for
	 *
	 * @returns {Array.<EpubItem>} The array of items
	 */
	getItemsOfType(itemType) {
		return this.items.filter((item) => item.getType() === itemType);
	}

	/**
	 * Returns all the items with the given media type that are attached to this EPUB.
	 *
	 * @example <caption>Example usage of getItemsOfMediaType.</caption>
	 * // Returns the list of items
	 * book.getItemsOfMediaType('application/octet-stream')
	 *
	 * @param {string} mediaType Media type of the item to search for
	 *
	 * @returns {Array.<EpubItem>} The array of items
	 */
	getItemsOfMediaType(mediaType) {
		return this.items.filter((item) => item.mediaType === mediaType);
	}

	/**
	 * Sets the template for the given template type.
	 *
	 * @example <caption>Example usage of setTemplate.</caption>
	 * book.setTemplate(TemplateType.NAV, '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"/>')
	 *
	 * @param {TemplateTypeEnum} templateType The template to update
	 * @param {string}           value        The new template value
	 */
	setTemplate(templateType, value) {
		this.templates[templateType] = value;
	}

	/**
	 * Get the template for the given template type.
	 *
	 * @example <caption>Example usage of getTemplate.</caption>
	 * // Returns the template as a string
	 * book.getTemplate(TemplateType.NAV)
	 *
	 * @param {TemplateTypeEnum} templateType The template to update
	 *
	 * @returns {string} The value of the template
	 */
	getTemplate(templateType) {
		return this.templates[templateType];
	}

	/**
	 * Appends a custom prefix to the list of prefixes to be added
	 * to the content.opf document
	 *
	 * @param {string} name The name of the namespace
	 * @param {string} uri  The URI for the namespace
	 */
	addPrefix(name, uri) {
		this.prefixes.push(`${name}: ${uri}`);
	}
}

export default EpubBook;
