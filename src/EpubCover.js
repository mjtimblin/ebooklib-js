import { decode } from 'base64-arraybuffer';
import EpubItem from './EpubItem';
import ItemTypeEnum from './enum/ItemTypeEnum';

/**
 * Class for representing the cover image in the EPUB file.
 *
 * @class
 * @augments EpubItem
 */
class EpubCover extends EpubItem {
	constructor(uid = 'cover-img', fileName = '') {
		super(uid, fileName);
	}

	/**
	 * Overrides EpubItem's getType method to always return COVER type
	 *
	 * @returns {ItemTypeEnum} The item's type
	 */
	static getType() {
		return ItemTypeEnum.COVER;
	}

	setContent(value) {
		const content =
			value instanceof String || typeof value === 'string'
				? decode(value)
				: value;
		this.content = content;
	}
}

EpubCover.prototype.toString = () => `<EpubCover:${this.id}:${this.fileName}>`;

export default EpubCover;
