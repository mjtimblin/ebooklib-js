"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _ItemTypeEnum = _interopRequireDefault(require("./enum/ItemTypeEnum"));

var _ItemTypeFileExtensionMap = _interopRequireDefault(require("./ItemTypeFileExtensionMap"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Base class for the items in a book
 */
var EpubItem = /*#__PURE__*/function () {
  /**
   * @param  {string}   [id=""]          Unique identifier for this item
   * @param  {string}   [fileName=""]    File name for this item
   * @param  {string}   [mediaType=""]   Media type for this item
   * @param  {string}   [content=""]     Content for this item
   * @param  {boolean}  [manifest=true]  If true, this item will be added to the manifest
   */
  function EpubItem() {
    var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var fileName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var mediaType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    var content = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    var manifest = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

    _classCallCheck(this, EpubItem);

    this.id = id;
    this.fileName = fileName;
    this.mediaType = mediaType;
    this.content = content;
    this.manifest = manifest;
    this.isLinear = true;
    this.book = null;
  }

  _createClass(EpubItem, [{
    key: "setContent",
    value: function setContent(value) {
      this.content = value;
    }
  }, {
    key: "getContent",
    value: function getContent() {
      return this.content;
    }
    /**
     * Guesses type according to the file extension. Might not be the best way to do it, but it works for now.
     * We map the type by finding the file extension in ItemTypeFileExtensionMap
     *
     * @returns {ItemTypeEnum} The type of the item
     */

  }, {
    key: "getType",
    value: function getType() {
      var extension = this.fileName.split('.').pop().toLowerCase();

      var itemType = _ItemTypeFileExtensionMap["default"].findIndex(function (extensions) {
        return extensions.includes(extension);
      });

      return itemType !== -1 ? itemType : _ItemTypeEnum["default"].UNKNOWN;
    }
  }]);

  return EpubItem;
}();

var _default = EpubItem;
exports["default"] = _default;