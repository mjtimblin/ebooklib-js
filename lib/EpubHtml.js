"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lodash = require("lodash");

var _EpubItem2 = _interopRequireDefault(require("./EpubItem"));

var _ItemTypeEnum = _interopRequireDefault(require("./enum/ItemTypeEnum"));

var _convertXmlStringToJS = _interopRequireDefault(require("./utils/convertXmlStringToJS"));

var _convertJsObjectToXML = _interopRequireDefault(require("./utils/convertJsObjectToXML"));

var _addChild = _interopRequireDefault(require("./utils/addChild"));

var _TemplateTypeEnum = _interopRequireDefault(require("./enum/TemplateTypeEnum"));

var _findNodesRecursively = _interopRequireDefault(require("./utils/findNodesRecursively"));

var _this2 = void 0;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/**
 * Class that represents an HTML document in the EPUB file.
 *
 * @class
 * @augments EpubItem
 */
var EpubHtml = /*#__PURE__*/function (_EpubItem) {
  _inherits(EpubHtml, _EpubItem);

  var _super = _createSuper(EpubHtml);

  function EpubHtml() {
    var _this;

    var uid = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var fileName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var mediaType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    var content = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var title = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
    var lang = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
    var direction = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
    var mediaOverlay = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : null;
    var mediaDuration = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : null;

    _classCallCheck(this, EpubHtml);

    _this = _super.call(this, uid, fileName, mediaType, content);
    _this.title = title;
    _this.lang = lang;
    _this.direction = direction;
    _this.mediaOverlay = mediaOverlay;
    _this.mediaDuration = mediaDuration;
    _this.links = [];
    _this.properties = [];
    _this.pages = [];
    return _this;
  }
  /**
   * Returns true if this document is a chapter and false if it is not
   *
   * @returns {boolean} The book value
   */


  _createClass(EpubHtml, [{
    key: "setLanguage",

    /**
     * Sets the language for this book item. By default it will user the language of the book, but
     * it can still be overwritten with this method.
     *
     * @param {string} lang  The new language code for this book item
     */
    value: function setLanguage(lang) {
      this.lang = lang;
    }
    /**
     * Gets the language code for this book item. The language of the book item can be different from the
     * language settings defined globally for the book.
     *
     * @returns {string}  The language code for this book item
     */

  }, {
    key: "getLanguage",
    value: function getLanguage() {
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

  }, {
    key: "addLink",
    value: function addLink(link) {
      this.links.push(link);

      if (Object.keys(link).includes('type') && link.type === 'text/javascript' && !this.properties.includes('scripted')) {
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

  }, {
    key: "getLinks",
    value: function getLinks() {
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

  }, {
    key: "getLinksOfType",
    value: function getLinksOfType(linkType) {
      return this.links.filter(function (link) {
        return Object.keys(link).includes('type') && link.type === linkType;
      });
    }
    /**
     * Adds an EpubItem to this document. It will create additional links according to the item type.
     *
     * @param {EpubItem} item  The EpubItem to add to this document
     */

  }, {
    key: "addItem",
    value: function addItem(item) {
      switch (item.getType()) {
        case _ItemTypeEnum["default"].STYLE:
          this.addLink({
            href: item.getName(),
            rel: 'stylesheet',
            type: 'text/css'
          });
          break;

        case _ItemTypeEnum["default"].SCRIPT:
          this.addLink({
            src: item.getName(),
            type: 'text/javascript'
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

  }, {
    key: "getBodyContent",
    value: function getBodyContent() {
      try {
        var wrappedContent = this.content && this.content.includes('body') ? this.content : "<div>".concat(this.content || '', "</div>");
        var content = (0, _convertXmlStringToJS["default"])(wrappedContent);
        var bodyNodes = (0, _findNodesRecursively["default"])([content], function (node) {
          return node.name === 'body';
        });
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

  }, {
    key: "getContent",
    value: function getContent() {
      try {
        var tree = (0, _convertXmlStringToJS["default"])(this.book.getTemplate(_TemplateTypeEnum["default"].CHAPTER));
        var treeRoot = tree.elements[tree.elements.length - 1];
        (0, _lodash.set)(treeRoot.attributes, 'lang', this.lang || this.book.language);
        (0, _lodash.set)(treeRoot.attributes, 'xml:lang', this.lang || this.book.language);
        var headElement = {
          type: 'element',
          name: 'head',
          attributes: {},
          elements: []
        };

        if (this.title !== '') {
          var titleElement = {
            type: 'element',
            name: 'title',
            attributes: {},
            elements: [{
              type: 'text',
              text: this.title
            }]
          };
          (0, _addChild["default"])(headElement, titleElement);
        }

        Object.values(this.links).forEach(function (link) {
          switch (link.type) {
            case 'text/javascript':
              {
                var scriptElement = {
                  type: 'element',
                  name: 'script',
                  attributes: {},
                  elements: []
                };
                (0, _lodash.set)(scriptElement.attributes, 'src', link.src);
                (0, _addChild["default"])(headElement, scriptElement);
                break;
              }

            case 'text/css':
              {
                var styleElement = {
                  type: 'element',
                  name: 'link',
                  attributes: {},
                  elements: []
                };
                (0, _lodash.set)(styleElement.attributes, 'rel', link.rel);
                (0, _lodash.set)(styleElement.attributes, 'href', link.href);
                (0, _addChild["default"])(headElement, styleElement);
                break;
              }

            default:
          }
        });
        (0, _addChild["default"])(treeRoot, headElement);
        var bodyElement = {
          type: 'element',
          name: 'body',
          attributes: {},
          elements: []
        };

        if (this.direction) {
          (0, _lodash.set)(bodyElement.attributes, 'dir', this.direction);
          (0, _lodash.set)(treeRoot.attributes, 'dir', this.direction);
        }

        var bodyContent = this.getBodyContent();

        if (bodyContent) {
          bodyContent.elements.forEach(function (node) {
            return (0, _addChild["default"])(bodyElement, node);
          });
        }

        (0, _addChild["default"])(treeRoot, bodyElement);
        tree.elements[tree.elements.length - 1] = treeRoot;
        return (0, _convertJsObjectToXML["default"])(tree);
      } catch (error) {
        return '';
      }
    }
  }], [{
    key: "isChapter",
    value: function isChapter() {
      return true;
    }
    /**
     * Overrides EpubItem's getType method to always return DOCUMENT type
     *
     * @returns {ItemTypeEnum} The item's type
     */

  }, {
    key: "getType",
    value: function getType() {
      return _ItemTypeEnum["default"].DOCUMENT;
    }
  }]);

  return EpubHtml;
}(_EpubItem2["default"]);

EpubHtml.prototype.toString = function () {
  return "<EpubHtml:".concat(_this2.id, ":").concat(_this2.fileName, ">");
};

var _default = EpubHtml;
exports["default"] = _default;