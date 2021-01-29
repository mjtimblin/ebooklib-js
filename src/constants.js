/* eslint-disable max-len */
/* eslint-disable no-unused-vars */

export const VERSION = '0.0.1';
export const NAMESPACES = {
	XML: 'http://www.w3.org/XML/1998/namespace',
	EPUB: 'http://www.idpf.org/2007/ops',
	DAISY: 'http://www.daisy.org/z3986/2005/ncx/',
	OPF: 'http://www.idpf.org/2007/opf',
	CONTAINERS: 'urn:oasis:names:tc:opendocument:xmlns:container',
	DC: 'http://purl.org/dc/elements/1.1/',
	XHTML: 'http://www.w3.org/1999/xhtml',
};
export const CONTAINER_PATH = 'META-INF/container.xml';
export const CONTAINER_XML = (folderName) =>
	`<?xml version='1.0' encoding='utf-8'?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
	<rootfiles>
		<rootfile media-type="application/oebps-package+xml" full-path="${folderName}/content.opf"/>
	</rootfiles>
</container>`.trim();
export const NCX_XML = `<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
   <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" />`.trim();
export const NAV_XML =
	'<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"/>';
export const CHAPTER_XML =
	'<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"  epub:prefix="z3998: http://www.daisy.org/z3998/2012/vocab/structure/#"></html>';
export const COVER_XML = `<?xml version='1.0' encoding='UTF-8'?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
 <head>
	<style>
		body { margin: 0em; padding: 0em; }
		img { max-width: 100%; max-height: 100%; }
	</style>
 </head>
 <body>
	 <img src="" alt="" />
 </body>
</html>`.trim();
export const IMAGE_MEDIA_TYPES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/svg+xml',
];
export const EPUB_WRITER_DEFAULT_OPTIONS = {
	epub2Guide: true,
	epub3Landmark: true,
	epub3Pages: true,
	landmarkTitle: 'Guide',
	pagesTitle: 'Pages',
	spineDirection: true,
	packageDirection: false,
	playOrder: {
		enabled: false,
		startFrom: 1,
	},
};
export const GUIDE_TO_LANDSCAPE_MAP = {
	notes: 'rearnotes',
	text: 'bodymatter',
};
export const BOOK_IDENTIFIER_ID = 'id';
export const BOOK_FOLDER_NAME = 'EPUB';
export const XML_JS_OPTIONS = {
	compact: false,
	spaces: 2,
};
