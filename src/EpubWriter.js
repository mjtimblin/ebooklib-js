import JSZip from 'jszip';
import { assign, extend, get, set } from 'lodash';
import { saveSync } from 'save-file';
import EpubBook from './EpubBook';
import EpubCover from './EpubCover';
import EpubNav from './EpubNav';
import EpubNcx from './EpubNcx';
import {
	CONTAINER_PATH,
	CONTAINER_XML,
	EPUB_WRITER_DEFAULT_OPTIONS,
	NAMESPACES,
	GUIDE_TO_LANDSCAPE_MAP,
	BOOK_IDENTIFIER_ID,
	BOOK_FOLDER_NAME,
} from './constants';
import EpubHtml from './EpubHtml';
import Link from './Link';
import Section from './Section';
import TemplateTypeEnum from './enum/TemplateTypeEnum';
import EpubItem from './EpubItem';
import getAllNodesRecursively from './utils/getAllNodesRecursively';
import ItemTypeEnum from './enum/ItemTypeEnum';
import convertJsObjectToXML from './utils/convertJsObjectToXML';
import convertXmlStringToJS from './utils/convertXmlStringToJS';
import addChild from './utils/addChild';

const { JSDOM } = require('jsdom');

const xmlJs = require('xml-js');
const { dirname, relative } = require('path');
/**
 * Class for writing an EpubBook to a file
 *
 * @class
 */
class EpubWriter {
	/**
	 *
	 * @param {string}        fileName     The filename of the .epub file
	 * @param {EpubBook}      book         The EpubBook object
	 * @param {(object|null)} [options={}] An object with option overrides
	 */
	constructor(fileName, book, options = {}) {
		this.fileName = fileName;
		this.book = book;
		this.options = assign({}, EPUB_WRITER_DEFAULT_OPTIONS, options);

		this.playOrder = {
			enabled: false,
			startFrom: 1,
		};

		if (
			Object.prototype.hasOwnProperty.call(this.options, 'playOrder') &&
			Object.prototype.hasOwnProperty.call(this.options, 'enabled')
		) {
			this.playOrder.enabled = this.options.playOrder.enabled;
		}

		if (
			Object.prototype.hasOwnProperty.call(this.options, 'playOrder') &&
			Object.prototype.hasOwnProperty.call(this.options, 'startFrom')
		) {
			this.playOrder.startFrom = this.options.playOrder.startFrom;
		}
	}

	/**
	 * Runs the the "beforeWrite" and "htmlBeforeWrite" callbacks in the configured
	 * plugins on the book and each item in the book
	 */
	process() {
		get(this.options, 'plugins', []).forEach((plugin) => {
			if (Object.prototype.hasOwnProperty.call(plugin, 'beforeWrite')) {
				plugin.beforeWrite(this.book);
			}
		});

		this.book.getItems().forEach((item) => {
			if (item instanceof EpubHtml) {
				get(this.options, 'plugins', []).forEach((plugin) => {
					if (
						Object.prototype.hasOwnProperty.call(
							plugin,
							'htmlBeforeWrite',
						)
					) {
						plugin.htmlBeforeWrite(this.book, item);
					}
				});
			}
		});
	}

	/**
	 * Gets the id of the NCX item
	 *
	 * @returns {string} The NCX id
	 */
	getNcxId() {
		const ncxItem = this.book
			.getItems()
			.find((item) => item instanceof EpubNcx);

		return ncxItem ? ncxItem.id : 'ncx';
	}

	/**
	 * Writes the mimetype file to the given zip file
	 *
	 * @param {JSZip} zip The zip file to write the container XML file to
	 */
	static writeMimetype(zip) {
		const content = 'application/epub+zip';
		zip.file('mimetype', Buffer.alloc(content.length, content));
	}

	/**
	 * Writes the container XML file to the given zip file
	 *
	 * @param {JSZip} zip The zip file to write the container XML file to
	 */
	static writeContainer(zip) {
		const content = CONTAINER_XML(BOOK_FOLDER_NAME);
		zip.file(CONTAINER_PATH, Buffer.alloc(content.length, content));
	}

	/**
	 * Builds and returns the package node for including in the OPF file
	 *
	 * @returns {xmlJs.Element} The metadata node
	 */
	getPackageNode() {
		const packageNode = {
			type: 'element',
			name: 'package',
			attributes: {},
			elements: [],
		};
		set(packageNode.attributes, 'xmlns', NAMESPACES.OPF);
		set(packageNode.attributes, 'unique-identifier', BOOK_IDENTIFIER_ID);
		set(packageNode.attributes, 'version', '3.0');

		if (
			this.book.direction !== null &&
			Object.prototype.hasOwnProperty.call(
				this.options,
				'packageDirection',
			) &&
			this.options.packageDirection
		) {
			set(packageNode.attributes, 'dir', this.book.direction);
		}

		return packageNode;
	}

	/**
	 * Builds and returns the metadata node for including in the OPF file
	 *
	 * @returns {Node} The metadata node
	 */
	getOpfMetadataNode() {
		const nsmap = {
			dc: NAMESPACES.DC,
			opf: NAMESPACES.OPF,
		};

		extend(nsmap, this.book.namespaces);

		const metadataNode = {
			type: 'element',
			name: 'metadata',
			attributes: {},
			elements: [],
		};

		Object.keys(nsmap).forEach((namespace) => {
			set(metadataNode.attributes, `xmlns:${namespace}`, nsmap[namespace]);
		});

		const mtime = Object.prototype.hasOwnProperty.call(this.options, 'mtime')
			? this.options.mtime
			: new Date();

		const metaNode = {
			type: 'element',
			name: 'meta',
			attributes: {
				property: 'dcterms:modified',
			},
			elements: [
				{
					type: 'text',
					text: `${mtime.toISOString().split('.')[0]}Z`, // Removes milliseconds from timestamp
				},
			],
		};

		addChild(metadataNode, metaNode);

		Object.keys(this.book.metadata).forEach((namespace) => {
			Object.keys(this.book.metadata[namespace]).forEach((nodeType) => {
				Object.entries(this.book.metadata[namespace][nodeType]).forEach(
					([, metadataObject]) => {
						const text = Object.keys(metadataObject)[0];
						const attributes = metadataObject[text] || {};
						const attributeNames = Object.keys(attributes);

						if (namespace !== 'null' && namespace === 'opf') {
							if (
								!attributeNames.includes('property') ||
								attributes.property !== 'dcterms:modified'
							) {
								const node = {
									type: 'element',
									name: 'meta',
									attributes,
									elements: [
										{
											type: 'text',
											text,
										},
									],
								};
								addChild(metadataNode, node);
							}
						} else {
							const newNodeType =
								namespace == 'null'
									? nodeType
									: `${namespace}:${nodeType}`;

							const node = {
								type: 'element',
								name: newNodeType,
								attributes,
								elements: [
									{
										type: 'text',
										text,
									},
								],
							};

							addChild(metadataNode, node);
						}
					},
				);
			});
		});

		return metadataNode;
	}

	/**
	 * Builds and returns the manifest node for including in the OPF file
	 *
	 * @returns {Node} The manifest node
	 */
	getOpfManifestNode() {
		const manifestNode = {
			type: 'element',
			name: 'manifest',
			attributes: {},
			elements: [],
		};

		this.book.getItems().forEach((item) => {
			if (item.manifest) {
				const itemNode = {
					type: 'element',
					name: 'item',
					attributes: {},
					elements: [],
				};
				set(itemNode.attributes, 'href', item.fileName);
				set(itemNode.attributes, 'id', item.id);
				set(itemNode.attributes, 'media-type', item.mediaType);

				if (item instanceof EpubNav) {
					set(itemNode.attributes, 'properties', 'nav');
				} else if (item instanceof EpubCover) {
					set(itemNode.attributes, 'properties', 'cover-image');
				} else {
					if (
						Object.prototype.hasOwnProperty.call(item, 'properties') &&
						item.properties.length > 0
					) {
						set(
							itemNode.attributes,
							'properties',
							item.properties.join(' '),
						);
					}

					if (
						Object.prototype.hasOwnProperty.call(item, 'mediaOverlay') &&
						item.mediaOverlay !== null
					) {
						set(itemNode.attributes, 'media-overlay', item.mediaOverlay);
					}

					if (
						Object.prototype.hasOwnProperty.call(item, 'mediaDuration') &&
						item.mediaDuration !== null
					) {
						set(itemNode.attributes, 'duration', item.mediaDuration);
					}
				}

				addChild(manifestNode, itemNode);
			}
		});

		return manifestNode;
	}

	/**
	 * Builds and returns the spine node for including in the OPF file
	 *
	 * @returns {Node} The spine node
	 */
	getOpfSpineNode() {
		const spineNode = {
			type: 'element',
			name: 'spine',
			attributes: {},
			elements: [],
		};
		set(spineNode.attributes, 'toc', this.getNcxId());

		this.book.spine.forEach((itemOrItemId) => {
			const isLinear = true;

			const item =
				itemOrItemId instanceof String || typeof itemOrItemId === 'string'
					? this.book.getItemWithId(itemOrItemId)
					: itemOrItemId;

			if (item !== null) {
				const itemNode = {
					type: 'element',
					name: 'itemref',
					attributes: {},
					elements: [],
				};
				set(itemNode.attributes, 'idref', item.id);

				if (!item.isLinear || !isLinear) {
					set(itemNode.attributes, 'linear', 'no');
				}

				addChild(spineNode, itemNode);
			}
		});

		return spineNode;
	}

	/**
	 * Builds and returns the guide node for including in the OPF file
	 * See http://www.idpf.org/epub/20/spec/OPF_2.0.1_draft.htm#Section2.6 for the specification
	 *
	 * @returns {(Node|null)} The guide node or null if there is no guide
	 */
	getOpfGuideNode() {
		if (
			this.book.guide.length > 0 &&
			Object.prototype.hasOwnProperty.call(this.options, 'epub2Guide')
		) {
			const guideNode = {
				type: 'element',
				name: 'guide',
				attributes: {},
				elements: [],
			};

			this.book.guide.forEach((item) => {
				const chapter = Object.prototype.hasOwnProperty.call(item, 'item')
					? item.item
					: item;

				const referenceNode = {
					type: 'element',
					name: 'reference',
					attributes: {},
					elements: [],
				};
				set(referenceNode.attributes, 'type', get(chapter, 'type', ''));
				set(referenceNode.attributes, 'title', get(chapter, 'title', ''));
				set(referenceNode.attributes, 'href', get(chapter, 'href'));

				addChild(guideNode, referenceNode);
			});
			return guideNode;
		}
		return null;
	}

	/**
	 * Builds and returns the bindings node for including in the OPF file
	 *
	 * @returns {(Node|null)} The bindings node or null if there are no bindings
	 */
	getOpfBindingsNode() {
		if (this.book.bindings.length > 0) {
			const bindingsNode = {
				type: 'element',
				name: 'bindings',
				attributes: {},
				elements: [],
			};
			this.book.bindings.forEach((binding) => {
				const bindingNode = {
					type: 'element',
					name: 'binding',
					attributes: {},
					elements: [],
				};
				Object.keys(binding).forEach((key) => {
					set(bindingNode.attributes, key, binding.key);
				});
				addChild(bindingsNode, binding);
			});
			return bindingsNode;
		}
		return null;
	}

	/**
	 * Writes the OPF file to the given zip file
	 *
	 * @param {JSZip} zip The zip file to write the OPF file to
	 */
	writeOpf(zip) {
		const root = {
			declaration: {
				attributes: {
					version: '1.0',
					encoding: 'utf-8',
				},
			},
			elements: [],
		};
		const packageNode = this.getPackageNode();

		const prefixes = [
			'rendition: http://www.idpf.org/vocab/rendition/#',
		].concat(this.book.prefixes);
		set(packageNode.attributes, 'prefix', prefixes.join(' '));

		addChild(packageNode, this.getOpfMetadataNode());
		addChild(packageNode, this.getOpfManifestNode());
		addChild(packageNode, this.getOpfSpineNode());

		const opfGuideNode = this.getOpfGuideNode();
		const getOpfBindingsNode = this.getOpfBindingsNode();

		if (opfGuideNode !== null) {
			addChild(packageNode, opfGuideNode);
		}

		if (getOpfBindingsNode !== null) {
			addChild(packageNode, getOpfBindingsNode);
		}

		addChild(root, packageNode);
		const xmlString = convertJsObjectToXML(root);

		zip.file(
			`${BOOK_FOLDER_NAME}/content.opf`,
			Buffer.alloc(xmlString.length, xmlString),
		);
	}

	/**
	 * TODO: Add description
	 *
	 * @param {object} node The JS representation of an XML node
	 *
	 * @returns {(string|null)} TODO: Add description
	 */
	static getHeaders(node) {
		for (let n = 1; n < 7; n += 1) {
			const headerElement = node.elements.find(
				(element) => get(element, 'name', '') === `h{n}`,
			);

			if (headerElement) {
				const text = headerElement.text.trim();
				if (text.length > 0) {
					return text;
				}
			}
		}
		return null;
	}

	/**
	 * Converts EpubHtml item into HTML pages
	 *
	 * @param {EpubHtml} item The item to get pages for
	 *
	 * @returns {Array.<object>} TODO: Add description
	 */
	static getPagesForItem(item) {
		const bodyNode = new JSDOM().window
			.DOMParser()
			.parseFromString(item.getBodyContent(), 'text/html');
		const pages = [];

		getAllNodesRecursively(bodyNode).forEach((node) => {
			if (node.attributes.includes('epub:type')) {
				if (get(node, 'id', null) !== null) {
					let text = null;

					const textElement = get(node, 'elements', []).find(
						(element) => element.type === 'text',
					);
					if (
						textElement &&
						textElement.text !== null &&
						textElement.text.trim() !== ''
					) {
						text = textElement.text.trim();
					}

					if (text === null) {
						text = get(node.attributes, 'aria-label', null);
					}

					if (text === null) {
						text = EpubWriter.getHeaders(node);
					}

					pages.push([item.fileName, node.id, text || node.id]);
				}
			}
		});
		return pages;
	}

	/**
	 * Converts EpubHtml items into HTML pages
	 *
	 * @param {EpubHtml} items The items to get pages for
	 *
	 * @returns {Array.<object>} TODO: Add description
	 */
	static getPagesForItems(items) {
		const pages = [];
		const pagesFromDocs = items.map((item) =>
			EpubWriter.getPagesForItem(item),
		);
		pagesFromDocs.forEach((pageFromDocs) => {
			pageFromDocs.forEach((item) => {
				pages.push(item);
			});
		});
		return pages;
	}

	/**
	 * Adds a nav section to the given parentNode
	 *
	 * @param {Node}             parentNode  The parent node where the item nodes will be placed in
	 * @param {Array.<EpubItem>} items       The EpubItems to render in the section
	 * @param {string}           navDirName  The directory that holds the nav file
	 *
	 */
	static createNavSection(parentNode, items, navDirName) {
		const olNode = {
			type: 'element',
			name: 'ol',
			attributes: {},
			elements: [],
		};

		items.forEach((item) => {
			if (item instanceof Array) {
				const liNode = {
					type: 'element',
					name: 'li',
					attributes: {},
					elements: [],
				};
				const anchorNode = {
					type: 'element',
					name: 'a',
					attributes: {},
					elements: [
						{
							type: 'text',
							text: item[0].title,
						},
					],
				};

				if (item[0] instanceof EpubHtml) {
					set(
						anchorNode.attributes,
						'href',
						relative(navDirName, item[0].fileName),
					);
				} else if (item[0] instanceof Section && item[0].href !== '') {
					set(
						anchorNode.attributes,
						'href',
						relative(navDirName, item[0].href),
					);
				} else {
					set(
						anchorNode.attributes,
						'href',
						relative(navDirName, item[0].href),
					);
				}

				addChild(liNode, anchorNode);
				addChild(olNode, liNode);
				EpubWriter.createNavSection(
					liNode,
					item[1] instanceof Array ? item[1] : [item[1]],
					navDirName,
				);
			} else if (item instanceof Link) {
				const liNode = {
					type: 'element',
					name: 'li',
					attributes: {},
					elements: [
						{
							type: 'element',
							name: 'a',
							attributes: {
								href: relative(navDirName, item.href),
							},
							elements: [
								{
									type: 'text',
									text: item.title,
								},
							],
						},
					],
				};
				addChild(olNode, liNode);
			} else if (item instanceof EpubHtml) {
				const liNode = {
					type: 'element',
					name: 'li',
					attributes: {},
					elements: [
						{
							type: 'element',
							name: 'a',
							attributes: {
								href: relative(navDirName, item.fileName),
							},
							elements: [
								{
									type: 'text',
									text: item.title,
								},
							],
						},
					],
				};

				addChild(olNode, liNode);
			}
		});

		addChild(parentNode, olNode);
	}

	/**
	 * Gets the nav page content for the given EpubNav item
	 *
	 * @param {EpubNav} item The EpubNav item to generate the nav page content for
	 *
	 * @returns {string} The content of the nav page
	 */
	getNavContent(item) {
		const navXmlDocument = convertXmlStringToJS(
			this.book.getTemplate(TemplateTypeEnum.NAV),
		);
		const rootNode =
			navXmlDocument.elements[navXmlDocument.elements.length - 1];

		set(rootNode.attributes, 'lang', this.book.language);
		set(rootNode.attributes, 'XML:lang', this.book.language);

		const navDirName = dirname(item.fileName);

		// Head
		const headNode = {
			type: 'element',
			name: 'head',
			attributes: {},
			elements: [
				{
					type: 'element',
					name: 'title',
					attributes: {},
					elements: [
						{
							type: 'text',
							text: this.book.title,
						},
					],
				},
			],
		};

		item.links.forEach((link) => {
			const linkNode = {
				type: 'element',
				name: 'link',
				attributes: {},
				elements: [],
			};
			set(linkNode.attributes, 'href', get(link, 'href', ''));
			set(linkNode.attributes, 'rel', 'stylesheet');
			set(linkNode.attributes, 'type', 'text/css');
			addChild(headNode, linkNode);
		});

		addChild(rootNode, headNode);

		// Nav Items
		const bodyNode = {
			type: 'element',
			name: 'body',
			attributes: {},
			elements: [],
		};

		const navNode = {
			type: 'element',
			name: 'nav',
			attributes: {
				'EPUB:type': 'toc',
				id: 'id',
				role: 'doc-toc',
			},
			elements: [
				{
					type: 'element',
					name: 'h2',
					attributes: {},
					elements: [
						{
							type: 'text',
							text: this.book.title,
						},
					],
				},
			],
		};

		EpubWriter.createNavSection(navNode, this.book.toc, navDirName);
		addChild(bodyNode, navNode);

		// Landmarks / Guide
		// http://www.idpf.org/epub/30/spec/epub30-contentdocs.html#sec-xhtml-nav-def-types-landmarks
		if (
			this.book.guide.length > 0 &&
			Object.prototype.hasOwnProperty.call(this.options, 'epub3Landmark') &&
			this.options.epub3Landmark
		) {
			const guideNavNode = {
				type: 'element',
				name: 'nav',
				attributes: {
					'EPUB:type': 'landmarks',
				},
				elements: [
					{
						type: 'text',
						text: get(this.options, 'landmarkTitle', 'Guide'),
					},
				],
			};

			const guildOlNode = {
				type: 'element',
				name: 'ol',
				attributes: {},
				elements: [],
			};

			this.book.guide.forEach((element) => {
				const liItemNode = {
					type: 'element',
					name: 'li',
					attributes: {},
					elements: [],
				};

				let href;
				let title;

				if (Object.prototype.hasOwnProperty.call(element, 'item')) {
					const chapter = get(element, 'item', null);
					if (chapter) {
						href = chapter.fileName;
						title = chapter.title;
					}
				} else {
					href = get(element, 'href', '');
					title = get(element, 'title', '');
				}

				const guideType = get(element, 'name', '');
				const anchorTagItemNode = {
					type: 'element',
					name: 'a',
					attributes: {
						'EPUB:type': get(
							GUIDE_TO_LANDSCAPE_MAP,
							guideType,
							guideType,
						),
						href: relative(navDirName, href),
					},
					elements: [
						{
							type: 'text',
							text: title,
						},
					],
				};

				addChild(liItemNode, anchorTagItemNode);
				addChild(guildOlNode, liItemNode);
			});

			addChild(guideNavNode, guildOlNode);

			addChild(bodyNode, guideNavNode);
		}

		if (
			Object.prototype.hasOwnProperty.call(this.options, 'epub3Pages') &&
			this.options.epub3Pages
		) {
			const items = this.book
				.getItemsOfType(ItemTypeEnum.DOCUMENT)
				.filter((i) => !(i instanceof EpubNav));
			const insertedPages = EpubWriter.getPagesForItems(items);

			if (insertedPages.length > 0) {
				const pageListNavNode = {
					type: 'element',
					name: 'nav',
					attributes: {},
					elements: [],
				};
				set(pageListNavNode.attributes, 'EPUB:type', 'pagelist');
				set(pageListNavNode.attributes, 'id', 'pages');
				set(pageListNavNode.attributes, 'hidden', 'hidden');

				const pageListContentTitleNode = {
					type: 'element',
					name: 'h2',
					attributes: {},
					elements: [
						{
							type: 'text',
							text: get(this.options, 'pagesTitle', 'Pages'),
						},
					],
				};
				addChild(pageListNavNode, pageListContentTitleNode);
				const pagesOlNode = {
					type: 'element',
					name: 'ol',
					attributes: {},
					elements: [],
				};

				insertedPages.entries(([fileName, pageref, label]) => {
					const pageLiItemNode = {
						type: 'element',
						name: 'li',
						attributes: {},
						elements: [
							{
								type: 'element',
								name: 'a',
								attributes: {
									href: relative(`${fileName}#${pageref}`, navDirName),
								},
								elements: [
									{
										type: 'text',
										text: label,
									},
								],
							},
						],
					};
					addChild(pagesOlNode, pageLiItemNode);
				});

				addChild(pageListNavNode, pagesOlNode);
				addChild(bodyNode, pageListNavNode);
			}
		}

		addChild(rootNode, bodyNode);
		return convertJsObjectToXML(navXmlDocument);
	}

	createNcxSection(parentNode, items, startingUid) {
		let uid = startingUid;

		items.forEach((item) => {
			if (item instanceof Array) {
				const [section, subsection] = item;
				const navPointNode = {
					type: 'element',
					name: 'navPoint',
					attributes: {
						id: section instanceof EpubHtml ? section.id : `sep_${uid}`,
					},
					elements: [
						{
							type: 'element',
							name: 'navLabel',
							attributes: {},
							elements: [
								{
									type: 'element',
									name: 'text',
									attributes: {},
									elements: [
										{
											type: 'text',
											text: section.title,
										},
									],
								},
							],
						},
					],
				};

				if (this.playOrder.enabled) {
					set(
						navPointNode.attributes,
						'playOrder',
						this.playOrder.startFrom.toString(),
					);
					this.playOrder.startFrom += 1;
				}

				let href = '';
				if (section instanceof EpubHtml) {
					href = section.fileName;
				} else if (section instanceof Section && section.href !== '') {
					href = section.href;
				} else if (section instanceof Link) {
					href = section.href;
				}

				const navContentNode = {
					type: 'element',
					name: 'content',
					attributes: {
						src: href,
					},
					elements: [],
				};
				addChild(navPointNode, navContentNode);

				uid = this.createNcxSection(
					navPointNode,
					subsection instanceof Array ? subsection : [subsection],
					uid + 1,
				);
				addChild(parentNode, navPointNode);
			} else if (item instanceof Link) {
				const contentIndex = parentNode.elements.findIndex(
					(node) => node.name === 'content',
				);

				if (
					contentIndex !== -1 &&
					get(parentNode.elements[contentIndex].attributes, 'src', '') ===
						''
				) {
					set(
						parentNode.elements[contentIndex].attributes,
						'src',
						item.href,
					);
				}

				const navPointNode = {
					type: 'element',
					name: 'navPoint',
					attributes: { id: item.uid },
					elements: [],
				};

				if (this.playOrder.enabled) {
					set(
						navPointNode.attributes,
						'playOrder',
						this.playOrder.startFrom.toString(),
					);
					this.playOrder.startFrom += 1;
				}

				const navLabelNode = {
					type: 'element',
					name: 'navLabel',
					attributes: {},
					elements: [
						{
							type: 'element',
							name: 'text',
							attributes: {},
							elements: [
								{
									type: 'text',
									text: item.title,
								},
							],
						},
					],
				};
				addChild(navPointNode, navLabelNode);

				const navContentNode = {
					type: 'element',
					name: 'content',
					attributes: {
						src: item.href,
					},
					elements: [],
				};
				addChild(navPointNode, navContentNode);
				addChild(parentNode, navPointNode);
			} else if (item instanceof EpubHtml) {
				const contentIndex = parentNode.elements.findIndex(
					(node) => node.name === 'content',
				);

				if (
					contentIndex !== -1 &&
					get(parentNode.elements[contentIndex].attributes, 'src', '') ===
						''
				) {
					set(
						parentNode.elements[contentIndex].attributes,
						'src',
						item.fileName,
					);
				}

				const navPointNode = {
					type: 'element',
					name: 'navPoint',
					attributes: { id: item.id },
					elements: [],
				};

				if (this.playOrder.enabled) {
					set(
						navPointNode.attributes,
						'playOrder',
						this.playOrder.startFrom.toString(),
					);
					this.playOrder.startFrom += 1;
				}

				const navLabelNode = {
					type: 'element',
					name: 'navLabel',
					attributes: {},
					elements: [
						{
							type: 'element',
							name: 'text',
							attributes: {},
							elements: [
								{
									type: 'text',
									text: item.title,
								},
							],
						},
					],
				};
				addChild(navPointNode, navLabelNode);

				const navContentNode = {
					type: 'element',
					name: 'content',
					attributes: {
						src: item.fileName,
					},
					elements: [],
				};
				addChild(navPointNode, navContentNode);
				addChild(parentNode, navPointNode);
			}
		});

		return uid;
	}

	/**
	 * Gets the NCX content
	 *
	 * @returns {string} The NCX content for the EPUB file.
	 */
	getNcxContent() {
		const ncxXmlDocument = convertXmlStringToJS(
			this.book.getTemplate(TemplateTypeEnum.NCX),
		);

		const rootNode =
			ncxXmlDocument.elements[ncxXmlDocument.elements.length - 1];

		const headNode = {
			type: 'element',
			name: 'head',
			attributes: {},
			elements: [
				{
					type: 'element',
					name: 'meta',
					attributes: {
						content: this.book.uid,
						name: 'dtb:uid',
					},
					elements: [],
				},
				{
					type: 'element',
					name: 'meta',
					attributes: {
						content: '0',
						name: 'dtb:depth',
					},
					elements: [],
				},
				{
					type: 'element',
					name: 'meta',
					attributes: {
						content: '0',
						name: 'dtb:totalPageCount',
					},
					elements: [],
				},
				{
					type: 'element',
					name: 'meta',
					attributes: {
						content: '0',
						name: 'dtb:maxPageNumber',
					},
					elements: [],
				},
			],
		};

		const docTitleNode = {
			type: 'element',
			name: 'docTitle',
			attributes: {},
			elements: [
				{
					type: 'element',
					name: 'text',
					attributes: {},
					elements: [
						{
							type: 'text',
							text: this.book.title,
						},
					],
				},
			],
		};

		addChild(rootNode, headNode);
		addChild(rootNode, docTitleNode);

		const navMapNode = {
			type: 'element',
			name: 'navMap',
			attributes: {},
			elements: [],
		};

		this.createNcxSection(navMapNode, this.book.toc, 0);

		addChild(rootNode, navMapNode);
		return convertJsObjectToXML(ncxXmlDocument);
	}

	/**
	 * Writes the EPUB items to the given zip file
	 *
	 * @param {JSZip} zip The zip file to write the item files to
	 */
	writeItems(zip) {
		this.book.getItems().forEach((item) => {
			if (item instanceof EpubNcx) {
				const content = this.getNcxContent();
				zip.file(
					`${BOOK_FOLDER_NAME}/${item.fileName}`,
					Buffer.from(content, 'utf-8'),
				);
			} else if (item instanceof EpubNav) {
				const content = this.getNavContent(item);
				zip.file(
					`${BOOK_FOLDER_NAME}/${item.fileName}`,
					Buffer.from(content, 'utf-8'),
				);
			} else if (item instanceof EpubCover) {
				const content = item.getContent();
				zip.file(`${BOOK_FOLDER_NAME}/${item.fileName}`, content);
			} else if (item instanceof EpubHtml) {
				const content = item.getContent();
				zip.file(
					`${BOOK_FOLDER_NAME}/${item.fileName}`,
					Buffer.from(content, 'utf-8'),
				);
			} else if (item.manifest) {
				const content = item.getContent();
				zip.file(
					`${BOOK_FOLDER_NAME}/${item.fileName}`,
					Buffer.alloc(content.length, content),
				);
			} else {
				const content = item.getContent();
				zip.file(`${item.fileName}`, Buffer.alloc(content.length, content));
			}
		});
	}

	/**
	 * Writes EPUB to a zip file
	 */
	write() {
		const zip = new JSZip();

		EpubWriter.writeMimetype(zip);
		EpubWriter.writeContainer(zip);
		this.writeOpf(zip);
		this.writeItems(zip);

		zip.generateAsync({ type: 'arraybuffer' }).then((data) =>
			saveSync(data, this.fileName),
		);
	}

	/**
	 * Writes EPUB to a Blob
	 */
	async writeToBlob() {
		const zip = new JSZip();

		EpubWriter.writeMimetype(zip);
		EpubWriter.writeContainer(zip);
		this.writeOpf(zip);
		this.writeItems(zip);

		return await zip.generateAsync({ type: 'blob' });
	}
}

export default EpubWriter;
