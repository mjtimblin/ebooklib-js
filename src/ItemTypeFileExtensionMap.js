import ItemTypeEnum from './enum/ItemTypeEnum';

const ItemTypeFileExtensionMap = [];
ItemTypeFileExtensionMap[ItemTypeEnum.UNKNOWN] = [];
ItemTypeFileExtensionMap[ItemTypeEnum.IMAGE] = [
	'jpg',
	'jpeg',
	'gif',
	'tiff',
	'tif',
	'png',
];
ItemTypeFileExtensionMap[ItemTypeEnum.STYLE] = ['css'];
ItemTypeFileExtensionMap[ItemTypeEnum.SCRIPT] = ['js'];
ItemTypeFileExtensionMap[ItemTypeEnum.NAVIGATION] = ['ncx'];
ItemTypeFileExtensionMap[ItemTypeEnum.VECTOR] = ['svg'];
ItemTypeFileExtensionMap[ItemTypeEnum.FONT] = ['otf', 'woff', 'ttf'];
ItemTypeFileExtensionMap[ItemTypeEnum.VIDEO] = ['mov', 'mp4', 'avi'];
ItemTypeFileExtensionMap[ItemTypeEnum.AUDIO] = ['mp3', 'ogg'];
ItemTypeFileExtensionMap[ItemTypeEnum.DOCUMENT] = [];
ItemTypeFileExtensionMap[ItemTypeEnum.COVER] = ['jpg', 'jpeg', 'png'];
ItemTypeFileExtensionMap[ItemTypeEnum.SMIL] = ['smil'];

export default ItemTypeFileExtensionMap;
