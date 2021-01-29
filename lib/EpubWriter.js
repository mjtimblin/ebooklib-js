"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _jszip = _interopRequireDefault(require("jszip"));

var _lodash = require("lodash");

var _saveFile = require("save-file");

var _EpubBook = _interopRequireDefault(require("./EpubBook"));

var _EpubCover = _interopRequireDefault(require("./EpubCover"));

var _EpubNav = _interopRequireDefault(require("./EpubNav"));

var _EpubNcx = _interopRequireDefault(require("./EpubNcx"));

var _constants = require("./constants");

var _EpubHtml = _interopRequireDefault(require("./EpubHtml"));

var _Link = _interopRequireDefault(require("./Link"));

var _Section = _interopRequireDefault(require("./Section"));

var _TemplateTypeEnum = _interopRequireDefault(require("./enum/TemplateTypeEnum"));

var _EpubItem = _interopRequireDefault(require("./EpubItem"));

var _getAllNodesRecursively = _interopRequireDefault(require("./utils/getAllNodesRecursively"));

var _ItemTypeEnum = _interopRequireDefault(require("./enum/ItemTypeEnum"));

var _convertJsObjectToXML = _interopRequireDefault(require("./utils/convertJsObjectToXML"));

var _convertXmlStringToJS = _interopRequireDefault(require("./utils/convertXmlStringToJS"));

var _addChild = _interopRequireDefault(require("./utils/addChild"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('jsdom'),
    JSDOM = _require.JSDOM;

var xmlJs = require('xml-js');

var _require2 = require('path'),
    dirname = _require2.dirname,
    relative = _require2.relative;
/**
 * Class for writing an EpubBook to a file
 *
 * @class
 */


var EpubWriter = /*#__PURE__*/function () {
  /**
   *
   * @param {string}        fileName     The filename of the .epub file
   * @param {EpubBook}      book         The EpubBook object
   * @param {(object|null)} [options={}] An object with option overrides
   */
  function EpubWriter(fileName, book) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, EpubWriter);

    this.fileName = fileName;
    this.book = book;
    this.options = (0, _lodash.assign)({}, _constants.EPUB_WRITER_DEFAULT_OPTIONS, options);
    this.playOrder = {
      enabled: false,
      startFrom: 1
    };

    if (Object.prototype.hasOwnProperty.call(this.options, 'playOrder') && Object.prototype.hasOwnProperty.call(this.options, 'enabled')) {
      this.playOrder.enabled = this.options.playOrder.enabled;
    }

    if (Object.prototype.hasOwnProperty.call(this.options, 'playOrder') && Object.prototype.hasOwnProperty.call(this.options, 'startFrom')) {
      this.playOrder.startFrom = this.options.playOrder.startFrom;
    }
  }
  /**
   * Runs the the "beforeWrite" and "htmlBeforeWrite" callbacks in the configured
   * plugins on the book and each item in the book
   */


  _createClass(EpubWriter, [{
    key: "process",
    value: function process() {
      var _this = this;

      (0, _lodash.get)(this.options, 'plugins', []).forEach(function (plugin) {
        if (Object.prototype.hasOwnProperty.call(plugin, 'beforeWrite')) {
          plugin.beforeWrite(_this.book);
        }
      });
      this.book.getItems().forEach(function (item) {
        if (item instanceof _EpubHtml["default"]) {
          (0, _lodash.get)(_this.options, 'plugins', []).forEach(function (plugin) {
            if (Object.prototype.hasOwnProperty.call(plugin, 'htmlBeforeWrite')) {
              plugin.htmlBeforeWrite(_this.book, item);
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

  }, {
    key: "getNcxId",
    value: function getNcxId() {
      var ncxItem = this.book.getItems().find(function (item) {
        return item instanceof _EpubNcx["default"];
      });
      return ncxItem ? ncxItem.id : 'ncx';
    }
    /**
     * Writes the mimetype file to the given zip file
     *
     * @param {JSZip} zip The zip file to write the container XML file to
     */

  }, {
    key: "getPackageNode",

    /**
     * Builds and returns the package node for including in the OPF file
     *
     * @returns {xmlJs.Element} The metadata node
     */
    value: function getPackageNode() {
      var packageNode = {
        type: 'element',
        name: 'package',
        attributes: {},
        elements: []
      };
      (0, _lodash.set)(packageNode.attributes, 'xmlns', _constants.NAMESPACES.OPF);
      (0, _lodash.set)(packageNode.attributes, 'unique-identifier', _constants.BOOK_IDENTIFIER_ID);
      (0, _lodash.set)(packageNode.attributes, 'version', '3.0');

      if (this.book.direction !== null && Object.prototype.hasOwnProperty.call(this.options, 'packageDirection') && this.options.packageDirection) {
        (0, _lodash.set)(packageNode.attributes, 'dir', this.book.direction);
      }

      return packageNode;
    }
    /**
     * Builds and returns the metadata node for including in the OPF file
     *
     * @returns {Node} The metadata node
     */

  }, {
    key: "getOpfMetadataNode",
    value: function getOpfMetadataNode() {
      var _this2 = this;

      var nsmap = {
        dc: _constants.NAMESPACES.DC,
        opf: _constants.NAMESPACES.OPF
      };
      (0, _lodash.extend)(nsmap, this.book.namespaces);
      var metadataNode = {
        type: 'element',
        name: 'metadata',
        attributes: {},
        elements: []
      };
      Object.keys(nsmap).forEach(function (namespace) {
        (0, _lodash.set)(metadataNode.attributes, "xmlns:".concat(namespace), nsmap[namespace]);
      });
      var mtime = Object.prototype.hasOwnProperty.call(this.options, 'mtime') ? this.options.mtime : new Date();
      var metaNode = {
        type: 'element',
        name: 'meta',
        attributes: {
          property: 'dcterms:modified'
        },
        elements: [{
          type: 'text',
          text: "".concat(mtime.toISOString().split('.')[0], "Z") // Removes milliseconds from timestamp

        }]
      };
      (0, _addChild["default"])(metadataNode, metaNode);
      Object.keys(this.book.metadata).forEach(function (namespace) {
        Object.keys(_this2.book.metadata[namespace]).forEach(function (nodeType) {
          Object.entries(_this2.book.metadata[namespace][nodeType]).forEach(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                metadataObject = _ref2[1];

            var text = Object.keys(metadataObject)[0];
            var attributes = metadataObject[text] || {};
            var attributeNames = Object.keys(attributes);

            if (namespace !== 'null' && namespace === 'opf') {
              if (!attributeNames.includes('property') || attributes.property !== 'dcterms:modified') {
                var node = {
                  type: 'element',
                  name: 'meta',
                  attributes: attributes,
                  elements: [{
                    type: 'text',
                    text: text
                  }]
                };
                (0, _addChild["default"])(metadataNode, node);
              }
            } else {
              var newNodeType = namespace == 'null' ? nodeType : "".concat(namespace, ":").concat(nodeType);
              var _node = {
                type: 'element',
                name: newNodeType,
                attributes: attributes,
                elements: [{
                  type: 'text',
                  text: text
                }]
              };
              (0, _addChild["default"])(metadataNode, _node);
            }
          });
        });
      });
      return metadataNode;
    }
    /**
     * Builds and returns the manifest node for including in the OPF file
     *
     * @returns {Node} The manifest node
     */

  }, {
    key: "getOpfManifestNode",
    value: function getOpfManifestNode() {
      var manifestNode = {
        type: 'element',
        name: 'manifest',
        attributes: {},
        elements: []
      };
      this.book.getItems().forEach(function (item) {
        if (item.manifest) {
          var itemNode = {
            type: 'element',
            name: 'item',
            attributes: {},
            elements: []
          };
          (0, _lodash.set)(itemNode.attributes, 'href', item.fileName);
          (0, _lodash.set)(itemNode.attributes, 'id', item.id);
          (0, _lodash.set)(itemNode.attributes, 'media-type', item.mediaType);

          if (item instanceof _EpubNav["default"]) {
            (0, _lodash.set)(itemNode.attributes, 'properties', 'nav');
          } else if (item instanceof _EpubCover["default"]) {
            (0, _lodash.set)(itemNode.attributes, 'properties', 'cover-image');
          } else {
            if (Object.prototype.hasOwnProperty.call(item, 'properties') && item.properties.length > 0) {
              (0, _lodash.set)(itemNode.attributes, 'properties', item.properties.join(' '));
            }

            if (Object.prototype.hasOwnProperty.call(item, 'mediaOverlay') && item.mediaOverlay !== null) {
              (0, _lodash.set)(itemNode.attributes, 'media-overlay', item.mediaOverlay);
            }

            if (Object.prototype.hasOwnProperty.call(item, 'mediaDuration') && item.mediaDuration !== null) {
              (0, _lodash.set)(itemNode.attributes, 'duration', item.mediaDuration);
            }
          }

          (0, _addChild["default"])(manifestNode, itemNode);
        }
      });
      return manifestNode;
    }
    /**
     * Builds and returns the spine node for including in the OPF file
     *
     * @returns {Node} The spine node
     */

  }, {
    key: "getOpfSpineNode",
    value: function getOpfSpineNode() {
      var _this3 = this;

      var spineNode = {
        type: 'element',
        name: 'spine',
        attributes: {},
        elements: []
      };
      (0, _lodash.set)(spineNode.attributes, 'toc', this.getNcxId());
      this.book.spine.forEach(function (itemOrItemId) {
        var isLinear = true;
        var item = itemOrItemId instanceof String || typeof itemOrItemId === 'string' ? _this3.book.getItemWithId(itemOrItemId) : itemOrItemId;

        if (item !== null) {
          var itemNode = {
            type: 'element',
            name: 'itemref',
            attributes: {},
            elements: []
          };
          (0, _lodash.set)(itemNode.attributes, 'idref', item.id);

          if (!item.isLinear || !isLinear) {
            (0, _lodash.set)(itemNode.attributes, 'linear', 'no');
          }

          (0, _addChild["default"])(spineNode, itemNode);
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

  }, {
    key: "getOpfGuideNode",
    value: function getOpfGuideNode() {
      if (this.book.guide.length > 0 && Object.prototype.hasOwnProperty.call(this.options, 'epub2Guide')) {
        var guideNode = {
          type: 'element',
          name: 'guide',
          attributes: {},
          elements: []
        };
        this.book.guide.forEach(function (item) {
          var chapter = Object.prototype.hasOwnProperty.call(item, 'item') ? item.item : item;
          var referenceNode = {
            type: 'element',
            name: 'reference',
            attributes: {},
            elements: []
          };
          (0, _lodash.set)(referenceNode.attributes, 'type', (0, _lodash.get)(chapter, 'type', ''));
          (0, _lodash.set)(referenceNode.attributes, 'title', (0, _lodash.get)(chapter, 'title', ''));
          (0, _lodash.set)(referenceNode.attributes, 'href', (0, _lodash.get)(chapter, 'href'));
          (0, _addChild["default"])(guideNode, referenceNode);
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

  }, {
    key: "getOpfBindingsNode",
    value: function getOpfBindingsNode() {
      if (this.book.bindings.length > 0) {
        var bindingsNode = {
          type: 'element',
          name: 'bindings',
          attributes: {},
          elements: []
        };
        this.book.bindings.forEach(function (binding) {
          var bindingNode = {
            type: 'element',
            name: 'binding',
            attributes: {},
            elements: []
          };
          Object.keys(binding).forEach(function (key) {
            (0, _lodash.set)(bindingNode.attributes, key, binding.key);
          });
          (0, _addChild["default"])(bindingsNode, binding);
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

  }, {
    key: "writeOpf",
    value: function writeOpf(zip) {
      var root = {
        declaration: {
          attributes: {
            version: '1.0',
            encoding: 'utf-8'
          }
        },
        elements: []
      };
      var packageNode = this.getPackageNode();
      var prefixes = ['rendition: http://www.idpf.org/vocab/rendition/#'].concat(this.book.prefixes);
      (0, _lodash.set)(packageNode.attributes, 'prefix', prefixes.join(' '));
      (0, _addChild["default"])(packageNode, this.getOpfMetadataNode());
      (0, _addChild["default"])(packageNode, this.getOpfManifestNode());
      (0, _addChild["default"])(packageNode, this.getOpfSpineNode());
      var opfGuideNode = this.getOpfGuideNode();
      var getOpfBindingsNode = this.getOpfBindingsNode();

      if (opfGuideNode !== null) {
        (0, _addChild["default"])(packageNode, opfGuideNode);
      }

      if (getOpfBindingsNode !== null) {
        (0, _addChild["default"])(packageNode, getOpfBindingsNode);
      }

      (0, _addChild["default"])(root, packageNode);
      var xmlString = (0, _convertJsObjectToXML["default"])(root);
      zip.file("".concat(_constants.BOOK_FOLDER_NAME, "/content.opf"), Buffer.alloc(xmlString.length, xmlString));
    }
    /**
     * TODO: Add description
     *
     * @param {object} node The JS representation of an XML node
     *
     * @returns {(string|null)} TODO: Add description
     */

  }, {
    key: "getNavContent",

    /**
     * Gets the nav page content for the given EpubNav item
     *
     * @param {EpubNav} item The EpubNav item to generate the nav page content for
     *
     * @returns {string} The content of the nav page
     */
    value: function getNavContent(item) {
      var navXmlDocument = (0, _convertXmlStringToJS["default"])(this.book.getTemplate(_TemplateTypeEnum["default"].NAV));
      var rootNode = navXmlDocument.elements[navXmlDocument.elements.length - 1];
      (0, _lodash.set)(rootNode.attributes, 'lang', this.book.language);
      (0, _lodash.set)(rootNode.attributes, 'XML:lang', this.book.language);
      var navDirName = dirname(item.fileName); // Head

      var headNode = {
        type: 'element',
        name: 'head',
        attributes: {},
        elements: [{
          type: 'element',
          name: 'title',
          attributes: {},
          elements: [{
            type: 'text',
            text: this.book.title
          }]
        }]
      };
      item.links.forEach(function (link) {
        var linkNode = {
          type: 'element',
          name: 'link',
          attributes: {},
          elements: []
        };
        (0, _lodash.set)(linkNode.attributes, 'href', (0, _lodash.get)(link, 'href', ''));
        (0, _lodash.set)(linkNode.attributes, 'rel', 'stylesheet');
        (0, _lodash.set)(linkNode.attributes, 'type', 'text/css');
        (0, _addChild["default"])(headNode, linkNode);
      });
      (0, _addChild["default"])(rootNode, headNode); // Nav Items

      var bodyNode = {
        type: 'element',
        name: 'body',
        attributes: {},
        elements: []
      };
      var navNode = {
        type: 'element',
        name: 'nav',
        attributes: {
          'EPUB:type': 'toc',
          id: 'id',
          role: 'doc-toc'
        },
        elements: [{
          type: 'element',
          name: 'h2',
          attributes: {},
          elements: [{
            type: 'text',
            text: this.book.title
          }]
        }]
      };
      EpubWriter.createNavSection(navNode, this.book.toc, navDirName);
      (0, _addChild["default"])(bodyNode, navNode); // Landmarks / Guide
      // http://www.idpf.org/epub/30/spec/epub30-contentdocs.html#sec-xhtml-nav-def-types-landmarks

      if (this.book.guide.length > 0 && Object.prototype.hasOwnProperty.call(this.options, 'epub3Landmark') && this.options.epub3Landmark) {
        var guideNavNode = {
          type: 'element',
          name: 'nav',
          attributes: {
            'EPUB:type': 'landmarks'
          },
          elements: [{
            type: 'text',
            text: (0, _lodash.get)(this.options, 'landmarkTitle', 'Guide')
          }]
        };
        var guildOlNode = {
          type: 'element',
          name: 'ol',
          attributes: {},
          elements: []
        };
        this.book.guide.forEach(function (element) {
          var liItemNode = {
            type: 'element',
            name: 'li',
            attributes: {},
            elements: []
          };
          var href;
          var title;

          if (Object.prototype.hasOwnProperty.call(element, 'item')) {
            var chapter = (0, _lodash.get)(element, 'item', null);

            if (chapter) {
              href = chapter.fileName;
              title = chapter.title;
            }
          } else {
            href = (0, _lodash.get)(element, 'href', '');
            title = (0, _lodash.get)(element, 'title', '');
          }

          var guideType = (0, _lodash.get)(element, 'name', '');
          var anchorTagItemNode = {
            type: 'element',
            name: 'a',
            attributes: {
              'EPUB:type': (0, _lodash.get)(_constants.GUIDE_TO_LANDSCAPE_MAP, guideType, guideType),
              href: relative(navDirName, href)
            },
            elements: [{
              type: 'text',
              text: title
            }]
          };
          (0, _addChild["default"])(liItemNode, anchorTagItemNode);
          (0, _addChild["default"])(guildOlNode, liItemNode);
        });
        (0, _addChild["default"])(guideNavNode, guildOlNode);
        (0, _addChild["default"])(bodyNode, guideNavNode);
      }

      if (Object.prototype.hasOwnProperty.call(this.options, 'epub3Pages') && this.options.epub3Pages) {
        var items = this.book.getItemsOfType(_ItemTypeEnum["default"].DOCUMENT).filter(function (i) {
          return !(i instanceof _EpubNav["default"]);
        });
        var insertedPages = EpubWriter.getPagesForItems(items);

        if (insertedPages.length > 0) {
          var pageListNavNode = {
            type: 'element',
            name: 'nav',
            attributes: {},
            elements: []
          };
          (0, _lodash.set)(pageListNavNode.attributes, 'EPUB:type', 'pagelist');
          (0, _lodash.set)(pageListNavNode.attributes, 'id', 'pages');
          (0, _lodash.set)(pageListNavNode.attributes, 'hidden', 'hidden');
          var pageListContentTitleNode = {
            type: 'element',
            name: 'h2',
            attributes: {},
            elements: [{
              type: 'text',
              text: (0, _lodash.get)(this.options, 'pagesTitle', 'Pages')
            }]
          };
          (0, _addChild["default"])(pageListNavNode, pageListContentTitleNode);
          var pagesOlNode = {
            type: 'element',
            name: 'ol',
            attributes: {},
            elements: []
          };
          insertedPages.entries(function (_ref3) {
            var _ref4 = _slicedToArray(_ref3, 3),
                fileName = _ref4[0],
                pageref = _ref4[1],
                label = _ref4[2];

            var pageLiItemNode = {
              type: 'element',
              name: 'li',
              attributes: {},
              elements: [{
                type: 'element',
                name: 'a',
                attributes: {
                  href: relative("".concat(fileName, "#").concat(pageref), navDirName)
                },
                elements: [{
                  type: 'text',
                  text: label
                }]
              }]
            };
            (0, _addChild["default"])(pagesOlNode, pageLiItemNode);
          });
          (0, _addChild["default"])(pageListNavNode, pagesOlNode);
          (0, _addChild["default"])(bodyNode, pageListNavNode);
        }
      }

      (0, _addChild["default"])(rootNode, bodyNode);
      return (0, _convertJsObjectToXML["default"])(navXmlDocument);
    }
  }, {
    key: "createNcxSection",
    value: function createNcxSection(parentNode, items, startingUid) {
      var _this4 = this;

      var uid = startingUid;
      items.forEach(function (item) {
        if (item instanceof Array) {
          var _item = _slicedToArray(item, 2),
              section = _item[0],
              subsection = _item[1];

          var navPointNode = {
            type: 'element',
            name: 'navPoint',
            attributes: {
              id: section instanceof _EpubHtml["default"] ? section.id : "sep_".concat(uid)
            },
            elements: [{
              type: 'element',
              name: 'navLabel',
              attributes: {},
              elements: [{
                type: 'element',
                name: 'text',
                attributes: {},
                elements: [{
                  type: 'text',
                  text: section.title
                }]
              }]
            }]
          };

          if (_this4.playOrder.enabled) {
            (0, _lodash.set)(navPointNode.attributes, 'playOrder', _this4.playOrder.startFrom.toString());
            _this4.playOrder.startFrom += 1;
          }

          var href = '';

          if (section instanceof _EpubHtml["default"]) {
            href = section.fileName;
          } else if (section instanceof _Section["default"] && section.href !== '') {
            href = section.href;
          } else if (section instanceof _Link["default"]) {
            href = section.href;
          }

          var navContentNode = {
            type: 'element',
            name: 'content',
            attributes: {
              src: href
            },
            elements: []
          };
          (0, _addChild["default"])(navPointNode, navContentNode);
          uid = _this4.createNcxSection(navPointNode, subsection instanceof Array ? subsection : [subsection], uid + 1);
          (0, _addChild["default"])(parentNode, navPointNode);
        } else if (item instanceof _Link["default"]) {
          var contentIndex = parentNode.elements.findIndex(function (node) {
            return node.name === 'content';
          });

          if (contentIndex !== -1 && (0, _lodash.get)(parentNode.elements[contentIndex].attributes, 'src', '') === '') {
            (0, _lodash.set)(parentNode.elements[contentIndex].attributes, 'src', item.href);
          }

          var _navPointNode = {
            type: 'element',
            name: 'navPoint',
            attributes: {
              id: item.uid
            },
            elements: []
          };

          if (_this4.playOrder.enabled) {
            (0, _lodash.set)(_navPointNode.attributes, 'playOrder', _this4.playOrder.startFrom.toString());
            _this4.playOrder.startFrom += 1;
          }

          var navLabelNode = {
            type: 'element',
            name: 'navLabel',
            attributes: {},
            elements: [{
              type: 'element',
              name: 'text',
              attributes: {},
              elements: [{
                type: 'text',
                text: item.title
              }]
            }]
          };
          (0, _addChild["default"])(_navPointNode, navLabelNode);
          var _navContentNode = {
            type: 'element',
            name: 'content',
            attributes: {
              src: item.href
            },
            elements: []
          };
          (0, _addChild["default"])(_navPointNode, _navContentNode);
          (0, _addChild["default"])(parentNode, _navPointNode);
        } else if (item instanceof _EpubHtml["default"]) {
          var _contentIndex = parentNode.elements.findIndex(function (node) {
            return node.name === 'content';
          });

          if (_contentIndex !== -1 && (0, _lodash.get)(parentNode.elements[_contentIndex].attributes, 'src', '') === '') {
            (0, _lodash.set)(parentNode.elements[_contentIndex].attributes, 'src', item.fileName);
          }

          var _navPointNode2 = {
            type: 'element',
            name: 'navPoint',
            attributes: {
              id: item.id
            },
            elements: []
          };

          if (_this4.playOrder.enabled) {
            (0, _lodash.set)(_navPointNode2.attributes, 'playOrder', _this4.playOrder.startFrom.toString());
            _this4.playOrder.startFrom += 1;
          }

          var _navLabelNode = {
            type: 'element',
            name: 'navLabel',
            attributes: {},
            elements: [{
              type: 'element',
              name: 'text',
              attributes: {},
              elements: [{
                type: 'text',
                text: item.title
              }]
            }]
          };
          (0, _addChild["default"])(_navPointNode2, _navLabelNode);
          var _navContentNode2 = {
            type: 'element',
            name: 'content',
            attributes: {
              src: item.fileName
            },
            elements: []
          };
          (0, _addChild["default"])(_navPointNode2, _navContentNode2);
          (0, _addChild["default"])(parentNode, _navPointNode2);
        }
      });
      return uid;
    }
    /**
     * Gets the NCX content
     *
     * @returns {string} The NCX content for the EPUB file.
     */

  }, {
    key: "getNcxContent",
    value: function getNcxContent() {
      var ncxXmlDocument = (0, _convertXmlStringToJS["default"])(this.book.getTemplate(_TemplateTypeEnum["default"].NCX));
      var rootNode = ncxXmlDocument.elements[ncxXmlDocument.elements.length - 1];
      var headNode = {
        type: 'element',
        name: 'head',
        attributes: {},
        elements: [{
          type: 'element',
          name: 'meta',
          attributes: {
            content: this.book.uid,
            name: 'dtb:uid'
          },
          elements: []
        }, {
          type: 'element',
          name: 'meta',
          attributes: {
            content: '0',
            name: 'dtb:depth'
          },
          elements: []
        }, {
          type: 'element',
          name: 'meta',
          attributes: {
            content: '0',
            name: 'dtb:totalPageCount'
          },
          elements: []
        }, {
          type: 'element',
          name: 'meta',
          attributes: {
            content: '0',
            name: 'dtb:maxPageNumber'
          },
          elements: []
        }]
      };
      var docTitleNode = {
        type: 'element',
        name: 'docTitle',
        attributes: {},
        elements: [{
          type: 'element',
          name: 'text',
          attributes: {},
          elements: [{
            type: 'text',
            text: this.book.title
          }]
        }]
      };
      (0, _addChild["default"])(rootNode, headNode);
      (0, _addChild["default"])(rootNode, docTitleNode);
      var navMapNode = {
        type: 'element',
        name: 'navMap',
        attributes: {},
        elements: []
      };
      this.createNcxSection(navMapNode, this.book.toc, 0);
      (0, _addChild["default"])(rootNode, navMapNode);
      return (0, _convertJsObjectToXML["default"])(ncxXmlDocument);
    }
    /**
     * Writes the EPUB items to the given zip file
     *
     * @param {JSZip} zip The zip file to write the item files to
     */

  }, {
    key: "writeItems",
    value: function writeItems(zip) {
      var _this5 = this;

      this.book.getItems().forEach(function (item) {
        if (item instanceof _EpubNcx["default"]) {
          var content = _this5.getNcxContent();

          zip.file("".concat(_constants.BOOK_FOLDER_NAME, "/").concat(item.fileName), Buffer.from(content, 'utf-8'));
        } else if (item instanceof _EpubNav["default"]) {
          var _content = _this5.getNavContent(item);

          zip.file("".concat(_constants.BOOK_FOLDER_NAME, "/").concat(item.fileName), Buffer.from(_content, 'utf-8'));
        } else if (item instanceof _EpubCover["default"]) {
          var _content2 = item.getContent();

          zip.file("".concat(_constants.BOOK_FOLDER_NAME, "/").concat(item.fileName), _content2);
        } else if (item instanceof _EpubHtml["default"]) {
          var _content3 = item.getContent();

          zip.file("".concat(_constants.BOOK_FOLDER_NAME, "/").concat(item.fileName), Buffer.from(_content3, 'utf-8'));
        } else if (item.manifest) {
          var _content4 = item.getContent();

          zip.file("".concat(_constants.BOOK_FOLDER_NAME, "/").concat(item.fileName), Buffer.alloc(_content4.length, _content4));
        } else {
          var _content5 = item.getContent();

          zip.file("".concat(item.fileName), Buffer.alloc(_content5.length, _content5));
        }
      });
    }
    /**
     * Writes EPUB to a zip file
     */

  }, {
    key: "write",
    value: function write() {
      var _this6 = this;

      var zip = new _jszip["default"]();
      EpubWriter.writeMimetype(zip);
      EpubWriter.writeContainer(zip);
      this.writeOpf(zip);
      this.writeItems(zip);
      zip.generateAsync({
        type: 'arraybuffer'
      }).then(function (data) {
        return (0, _saveFile.saveSync)(data, _this6.fileName);
      });
    }
    /**
     * Writes EPUB to a Blob
     */

  }, {
    key: "writeToBlob",
    value: function () {
      var _writeToBlob = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var zip;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                zip = new _jszip["default"]();
                EpubWriter.writeMimetype(zip);
                EpubWriter.writeContainer(zip);
                this.writeOpf(zip);
                this.writeItems(zip);
                _context.next = 7;
                return zip.generateAsync({
                  type: 'blob'
                });

              case 7:
                return _context.abrupt("return", _context.sent);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function writeToBlob() {
        return _writeToBlob.apply(this, arguments);
      }

      return writeToBlob;
    }()
  }], [{
    key: "writeMimetype",
    value: function writeMimetype(zip) {
      var content = 'application/epub+zip';
      zip.file('mimetype', Buffer.alloc(content.length, content));
    }
    /**
     * Writes the container XML file to the given zip file
     *
     * @param {JSZip} zip The zip file to write the container XML file to
     */

  }, {
    key: "writeContainer",
    value: function writeContainer(zip) {
      var content = (0, _constants.CONTAINER_XML)(_constants.BOOK_FOLDER_NAME);
      zip.file(_constants.CONTAINER_PATH, Buffer.alloc(content.length, content));
    }
  }, {
    key: "getHeaders",
    value: function getHeaders(node) {
      for (var n = 1; n < 7; n += 1) {
        var headerElement = node.elements.find(function (element) {
          return (0, _lodash.get)(element, 'name', '') === "h{n}";
        });

        if (headerElement) {
          var text = headerElement.text.trim();

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

  }, {
    key: "getPagesForItem",
    value: function getPagesForItem(item) {
      var bodyNode = new JSDOM().window.DOMParser().parseFromString(item.getBodyContent(), 'text/html');
      var pages = [];
      (0, _getAllNodesRecursively["default"])(bodyNode).forEach(function (node) {
        if (node.attributes.includes('epub:type')) {
          if ((0, _lodash.get)(node, 'id', null) !== null) {
            var text = null;
            var textElement = (0, _lodash.get)(node, 'elements', []).find(function (element) {
              return element.type === 'text';
            });

            if (textElement && textElement.text !== null && textElement.text.trim() !== '') {
              text = textElement.text.trim();
            }

            if (text === null) {
              text = (0, _lodash.get)(node.attributes, 'aria-label', null);
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

  }, {
    key: "getPagesForItems",
    value: function getPagesForItems(items) {
      var pages = [];
      var pagesFromDocs = items.map(function (item) {
        return EpubWriter.getPagesForItem(item);
      });
      pagesFromDocs.forEach(function (pageFromDocs) {
        pageFromDocs.forEach(function (item) {
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

  }, {
    key: "createNavSection",
    value: function createNavSection(parentNode, items, navDirName) {
      var olNode = {
        type: 'element',
        name: 'ol',
        attributes: {},
        elements: []
      };
      items.forEach(function (item) {
        if (item instanceof Array) {
          var liNode = {
            type: 'element',
            name: 'li',
            attributes: {},
            elements: []
          };
          var anchorNode = {
            type: 'element',
            name: 'a',
            attributes: {},
            elements: [{
              type: 'text',
              text: item[0].title
            }]
          };

          if (item[0] instanceof _EpubHtml["default"]) {
            (0, _lodash.set)(anchorNode.attributes, 'href', relative(navDirName, item[0].fileName));
          } else if (item[0] instanceof _Section["default"] && item[0].href !== '') {
            (0, _lodash.set)(anchorNode.attributes, 'href', relative(navDirName, item[0].href));
          } else {
            (0, _lodash.set)(anchorNode.attributes, 'href', relative(navDirName, item[0].href));
          }

          (0, _addChild["default"])(liNode, anchorNode);
          (0, _addChild["default"])(olNode, liNode);
          EpubWriter.createNavSection(liNode, item[1] instanceof Array ? item[1] : [item[1]], navDirName);
        } else if (item instanceof _Link["default"]) {
          var _liNode = {
            type: 'element',
            name: 'li',
            attributes: {},
            elements: [{
              type: 'element',
              name: 'a',
              attributes: {
                href: relative(navDirName, item.href)
              },
              elements: [{
                type: 'text',
                text: item.title
              }]
            }]
          };
          (0, _addChild["default"])(olNode, _liNode);
        } else if (item instanceof _EpubHtml["default"]) {
          var _liNode2 = {
            type: 'element',
            name: 'li',
            attributes: {},
            elements: [{
              type: 'element',
              name: 'a',
              attributes: {
                href: relative(navDirName, item.fileName)
              },
              elements: [{
                type: 'text',
                text: item.title
              }]
            }]
          };
          (0, _addChild["default"])(olNode, _liNode2);
        }
      });
      (0, _addChild["default"])(parentNode, olNode);
    }
  }]);

  return EpubWriter;
}();

var _default = EpubWriter;
exports["default"] = _default;