import EpubItem from './EpubItem';
import ItemTypeEnum from './enum/ItemTypeEnum';

/**
 * Class that represents a SMIL file in the EPUB file.
 *
 * @class
 * @augments EpubItem
 */
class EpubSMIL extends EpubItem {
	constructor(uid, fileName, content) {
		super(uid, fileName, 'application/smil+xml', content);
	}

	/**
	 * Overrides EpubItem's getType method to always return SMIL type
	 *
	 * @returns {ItemTypeEnum} The item's type
	 */
	static getType() {
		return ItemTypeEnum.SMIL;
	}
}

EpubSMIL.prototype.toString = () => `<EpubSMIL:${this.id}:${this.fileName}>`;

export default EpubSMIL;
