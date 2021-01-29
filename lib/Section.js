"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Section = function Section(title) {
  var href = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  _classCallCheck(this, Section);

  this.title = title;
  this.href = href;
};

var _default = Section;
exports["default"] = _default;