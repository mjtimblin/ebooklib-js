import ItemTypeEnum from './enum/ItemTypeEnum';
import ItemTypeFileExtensionMap from './ItemTypeFileExtensionMap';

/**
 * Base class for the items in a book
 */
class EpubItem {
	/**
	 * @param  {string}   [id=""]          Unique identifier for this item
	 * @param  {string}   [fileName=""]    File name for this item
	 * @param  {string}   [mediaType=""]   Media type for this item
	 * @param  {string}   [content=""]     Content for this item
	 * @param  {boolean}  [manifest=true]  If true, this item will be added to the manifest
	 */
	constructor(
		id = '',
		fileName = '',
		mediaType = '',
		content = '',
		manifest = true,
	) {
		this.id = id;
		this.fileName = fileName;
		this.mediaType = mediaType;
		this.content = content;
		this.manifest = manifest;
		this.isLinear = true;
		this.book = null;
	}

	setContent(value) {
		this.content = value;
	}

	getContent() {
		return this.content;
	}

	/**
	 * Guesses type according to the file extension. Might not be the best way to do it, but it works for now.
	 * We map the type by finding the file extension in ItemTypeFileExtensionMap
	 *
	 * @returns {ItemTypeEnum} The type of the item
	 */
	getType() {
		const extension = this.fileName.split('.').pop().toLowerCase();

		const itemType = ItemTypeFileExtensionMap.findIndex((extensions) =>
			extensions.includes(extension),
		);

		return itemType !== -1 ? itemType : ItemTypeEnum.UNKNOWN;
	}
}

export default EpubItem;
