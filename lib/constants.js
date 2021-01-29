"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.XML_JS_OPTIONS = exports.BOOK_FOLDER_NAME = exports.BOOK_IDENTIFIER_ID = exports.GUIDE_TO_LANDSCAPE_MAP = exports.EPUB_WRITER_DEFAULT_OPTIONS = exports.IMAGE_MEDIA_TYPES = exports.COVER_XML = exports.CHAPTER_XML = exports.NAV_XML = exports.NCX_XML = exports.CONTAINER_XML = exports.CONTAINER_PATH = exports.NAMESPACES = exports.VERSION = void 0;

/* eslint-disable max-len */

/* eslint-disable no-unused-vars */
var VERSION = '0.0.1';
exports.VERSION = VERSION;
var NAMESPACES = {
  XML: 'http://www.w3.org/XML/1998/namespace',
  EPUB: 'http://www.idpf.org/2007/ops',
  DAISY: 'http://www.daisy.org/z3986/2005/ncx/',
  OPF: 'http://www.idpf.org/2007/opf',
  CONTAINERS: 'urn:oasis:names:tc:opendocument:xmlns:container',
  DC: 'http://purl.org/dc/elements/1.1/',
  XHTML: 'http://www.w3.org/1999/xhtml'
};
exports.NAMESPACES = NAMESPACES;
var CONTAINER_PATH = 'META-INF/container.xml';
exports.CONTAINER_PATH = CONTAINER_PATH;

var CONTAINER_XML = function CONTAINER_XML(folderName) {
  return "<?xml version='1.0' encoding='utf-8'?>\n<container xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\" version=\"1.0\">\n\t<rootfiles>\n\t\t<rootfile media-type=\"application/oebps-package+xml\" full-path=\"".concat(folderName, "/content.opf\"/>\n\t</rootfiles>\n</container>").trim();
};

exports.CONTAINER_XML = CONTAINER_XML;
var NCX_XML = "<!DOCTYPE ncx PUBLIC \"-//NISO//DTD ncx 2005-1//EN\" \"http://www.daisy.org/z3986/2005/ncx-2005-1.dtd\">\n   <ncx xmlns=\"http://www.daisy.org/z3986/2005/ncx/\" version=\"2005-1\" />".trim();
exports.NCX_XML = NCX_XML;
var NAV_XML = '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"/>';
exports.NAV_XML = NAV_XML;
var CHAPTER_XML = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"  epub:prefix="z3998: http://www.daisy.org/z3998/2012/vocab/structure/#"></html>';
exports.CHAPTER_XML = CHAPTER_XML;
var COVER_XML = "<?xml version='1.0' encoding='UTF-8'?>\n<!DOCTYPE html>\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\" lang=\"en\" xml:lang=\"en\">\n <head>\n\t<style>\n\t\tbody { margin: 0em; padding: 0em; }\n\t\timg { max-width: 100%; max-height: 100%; }\n\t</style>\n </head>\n <body>\n\t <img src=\"\" alt=\"\" />\n </body>\n</html>".trim();
exports.COVER_XML = COVER_XML;
var IMAGE_MEDIA_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
exports.IMAGE_MEDIA_TYPES = IMAGE_MEDIA_TYPES;
var EPUB_WRITER_DEFAULT_OPTIONS = {
  epub2Guide: true,
  epub3Landmark: true,
  epub3Pages: true,
  landmarkTitle: 'Guide',
  pagesTitle: 'Pages',
  spineDirection: true,
  packageDirection: false,
  playOrder: {
    enabled: false,
    startFrom: 1
  }
};
exports.EPUB_WRITER_DEFAULT_OPTIONS = EPUB_WRITER_DEFAULT_OPTIONS;
var GUIDE_TO_LANDSCAPE_MAP = {
  notes: 'rearnotes',
  text: 'bodymatter'
};
exports.GUIDE_TO_LANDSCAPE_MAP = GUIDE_TO_LANDSCAPE_MAP;
var BOOK_IDENTIFIER_ID = 'id';
exports.BOOK_IDENTIFIER_ID = BOOK_IDENTIFIER_ID;
var BOOK_FOLDER_NAME = 'EPUB';
exports.BOOK_FOLDER_NAME = BOOK_FOLDER_NAME;
var XML_JS_OPTIONS = {
  compact: false,
  spaces: 2
};
exports.XML_JS_OPTIONS = XML_JS_OPTIONS;