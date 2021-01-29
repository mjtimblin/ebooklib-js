import EpubItem from './EpubItem';
import ItemTypeEnum from './enum/ItemTypeEnum';

/**
 * Class for representing an image in the EPUB file.
 *
 * @class
 * @augments EpubItem
 */
class EpubImage extends EpubItem {
	/**
	 * Overrides EpubItem's getType method to always return IMAGE type
	 *
	 * @returns {ItemTypeEnum} The item's type
	 */
	static getType() {
		return ItemTypeEnum.IMAGE;
	}
}

EpubImage.prototype.toString = () => `<EpubImage:${this.id}:${this.fileName}>`;

export default EpubImage;
