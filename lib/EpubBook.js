"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lodash = require("lodash");

var _constants = require("./constants");

var _uuidv = _interopRequireDefault(require("./utils/uuidv4"));

var _DirectionEnum = _interopRequireDefault(require("./enum/DirectionEnum"));

var _EpubCover = _interopRequireDefault(require("./EpubCover"));

var _EpubCoverHtml = _interopRequireDefault(require("./EpubCoverHtml"));

var _EpubHtml = _interopRequireDefault(require("./EpubHtml"));

var _EpubItem = _interopRequireDefault(require("./EpubItem"));

var _EpubImage = _interopRequireDefault(require("./EpubImage"));

var _ItemTypeEnum = _interopRequireDefault(require("./enum/ItemTypeEnum"));

var _TemplateTypeEnum = _interopRequireDefault(require("./enum/TemplateTypeEnum"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var mimeTypes = require('mime-types');
/**
 * Class that represents EPUB book data.
 *
 * @class
 */


var EpubBook = /*#__PURE__*/function () {
  function EpubBook() {
    _classCallCheck(this, EpubBook);

    this.EPUB_VERSION = null;
    this.reset();
  }
  /**
   * Initialized all needed variables to default values
   */


  _createClass(EpubBook, [{
    key: "reset",
    value: function reset() {
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
      this.templates[_TemplateTypeEnum["default"].NCX] = _constants.NCX_XML;
      this.templates[_TemplateTypeEnum["default"].NAV] = _constants.NAV_XML;
      this.templates[_TemplateTypeEnum["default"].CHAPTER] = _constants.CHAPTER_XML;
      this.templates[_TemplateTypeEnum["default"].COVER] = _constants.COVER_XML;
      this.addMetadata('OPF', 'generator', '', {
        name: 'generator',
        content: "EbookLib-JS ".concat(_constants.VERSION)
      }); // Default to using a randomly-unique identifier

      this.uid = (0, _uuidv["default"])(); // Custom prefixes and namespaces to be set to the content.opf doc

      this.prefixes = [];
      this.namespaces = {};
    }
    /**
     * Sets the unique identifier for this EPUB.
     *
     * @param {string} value The id of the book
     */

  }, {
    key: "setIdentifier",
    value: function setIdentifier(value) {
      this.id = value;
      this.setUniqueMetadata('DC', 'identifier', this.id, {
        id: _constants.BOOK_IDENTIFIER_ID
      });
    }
    /**
     * Sets the title for this EPUB. You can set multiple titles.
     *
     * @param {string} value The new title
     */

  }, {
    key: "setTitle",
    value: function setTitle(value) {
      this.title = value;
      this.addMetadata('DC', 'title', value);
    }
    /**
     * Sets the language for this EPUB. You can set multiple languages. Specific items in the book
     * can have different language settings.
     *
     * @param {string} value The new language code
     */

  }, {
    key: "setLanguage",
    value: function setLanguage(value) {
      this.language = value;
      this.addMetadata('DC', 'language', value);
    }
    /**
     * Sets the direction for this EPUB.
     *
     * @param {DirectionEnum} value The new direction
     */

  }, {
    key: "setCover",

    /**
     * Sets the cover and creates the cover document if needed.
     *
     * @param {string} fileName The file name of the cover page
     * @param {string} content Content for the cover page
     * @param {boolean} createPage Should cover page be defined. Defined as bool value (optional). Defaults to true
     */
    value: function setCover(fileName, content) {
      var createPage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var c0 = new _EpubCover["default"]('cover-img', fileName);
      c0.setContent(content);
      this.addItem(c0);

      if (createPage) {
        var c1 = new _EpubCoverHtml["default"]('cover', 'cover.xhtml', fileName);
        this.addItem(c1);
      }

      var attributes = {
        name: 'cover',
        content: 'cover-img'
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

  }, {
    key: "addAuthor",
    value: function addAuthor(author) {
      var fileAs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var role = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var uid = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'creator';
      this.addMetadata('DC', 'creator', author, {
        id: uid
      });

      if (fileAs) {
        this.addMetadata(null, 'meta', fileAs, {
          refines: "#".concat(uid),
          property: 'file-as',
          scheme: 'marc:relators'
        });
      }

      if (role) {
        this.addMetadata(null, 'meta', role, {
          refines: "#".concat(uid),
          property: 'role',
          scheme: 'marc:relators'
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

  }, {
    key: "addMetadata",
    value: function addMetadata(namespace, name, value) {
      var others = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var lowercaseNamespace = namespace === null ? 'null' : namespace.toLowerCase();

      if (!Object.keys(this.metadata).includes(lowercaseNamespace)) {
        this.metadata[lowercaseNamespace] = {};
      }

      if (!Object.keys(this.metadata[lowercaseNamespace]).includes(name)) {
        this.metadata[lowercaseNamespace][name] = [];
      }

      var metadataObject = {};
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

  }, {
    key: "getMetadata",
    value: function getMetadata(namespace, name) {
      var lowercaseNamespace = namespace !== null ? namespace.toLowerCase() : null;
      return (0, _lodash.get)(this.metadata[lowercaseNamespace], name, []);
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

  }, {
    key: "setUniqueMetadata",
    value: function setUniqueMetadata(namespace, name, value) {
      var others = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var lowercaseNamespace = namespace !== null ? namespace.toLowerCase() : null;

      if (Object.keys(this.metadata).includes(lowercaseNamespace) && Object.keys(this.metadata[lowercaseNamespace]).includes(name)) {
        this.metadata[lowercaseNamespace][name] = [{
          value: others
        }];
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

  }, {
    key: "addItem",
    value: function addItem(item) {
      if (item.mediaType === '') {
        // eslint-disable-next-line no-param-reassign
        item.mediaType = mimeTypes.lookup(item.fileName) || 'application/octet-stream';
      }

      if (!item.id) {
        if (item instanceof _EpubHtml["default"]) {
          this.htmlItemsCount += 1; // eslint-disable-next-line no-param-reassign

          item.id = "chapter_".concat(this.htmlItemsCount);
        } else if (item instanceof _EpubImage["default"]) {
          this.imageItemsCount += 1; // eslint-disable-next-line no-param-reassign

          item.id = "image_".concat(this.imageItemsCount);
        } else {
          this.staticItemsCount += 1; // eslint-disable-next-line no-param-reassign

          item.id = "static_".concat(this.staticItemsCount);
        }
      } // eslint-disable-next-line no-param-reassign


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

  }, {
    key: "getItemWithId",
    value: function getItemWithId(uid) {
      return this.getItems().find(function (item) {
        return item.id === uid;
      }) || null;
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

  }, {
    key: "getItemWithHref",
    value: function getItemWithHref(href) {
      return this.getItems().find(function (item) {
        return item.getName() === href;
      }) || null;
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

  }, {
    key: "getItems",
    value: function getItems() {
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

  }, {
    key: "getItemsOfType",
    value: function getItemsOfType(itemType) {
      return this.items.filter(function (item) {
        return item.getType() === itemType;
      });
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

  }, {
    key: "getItemsOfMediaType",
    value: function getItemsOfMediaType(mediaType) {
      return this.items.filter(function (item) {
        return item.mediaType === mediaType;
      });
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

  }, {
    key: "setTemplate",
    value: function setTemplate(templateType, value) {
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

  }, {
    key: "getTemplate",
    value: function getTemplate(templateType) {
      return this.templates[templateType];
    }
    /**
     * Appends a custom prefix to the list of prefixes to be added
     * to the content.opf document
     *
     * @param {string} name The name of the namespace
     * @param {string} uri  The URI for the namespace
     */

  }, {
    key: "addPrefix",
    value: function addPrefix(name, uri) {
      this.prefixes.push("".concat(name, ": ").concat(uri));
    }
  }, {
    key: "direction",
    set: function set(value) {
      switch (value) {
        case _DirectionEnum["default"].DEFAULT:
          this.direction = 'default';
          break;

        case _DirectionEnum["default"].LEFT_TO_RIGHT:
          this.direction = 'ltr';
          break;

        case _DirectionEnum["default"].RIGHT_TO_LEFT:
          this.direction = 'rtl';
          break;

        default:
      }
    }
  }]);

  return EpubBook;
}();

var _default = EpubBook;
exports["default"] = _default;