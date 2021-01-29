import EpubHtml from './EpubHtml';

/**
 * Class that represents the nav document for the EPUB file.
 *
 * @class
 * @augments EpubHtml
 */
class EpubNav extends EpubHtml {
	constructor(
		uid = 'nav',
		fileName = 'nav.xhtml',
		mediaType = 'application/xhtml+xml',
	) {
		super(uid, fileName, mediaType);
	}

	/**
	 * Returns if this document is a chapter or not.
	 * The epub cover is never a chapter, so this will always return false.
	 *
	 * @returns {boolean}  Returns true if this document is a chapter
	 */
	static isChapter() {
		return false;
	}
}

EpubNav.prototype.toString = () => `<EpubNav:${this.id}:${this.fileName}>`;

export default EpubNav;
