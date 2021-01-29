import EpubItem from './EpubItem';
import ItemTypeEnum from './enum/ItemTypeEnum';

/**
 * Class that represents Navigation Control File (NCX) in the EPUB file
 *
 * @class
 * @augments EpubItem
 */
class EpubNcx extends EpubItem {
	constructor(uid = 'ncx', fileName = 'toc.ncx') {
		super(uid, fileName, 'application/x-dtbncx+xml');
	}

	/**
	 * Overrides EpubItem's getType method to always return NAVIGATION type
	 *
	 * @returns {ItemTypeEnum} The item's type
	 */
	static getType() {
		return ItemTypeEnum.NAVIGATION;
	}
}

EpubNcx.prototype.toString = () => `<EpubNcx:${this.id}>`;

export default EpubNcx;
