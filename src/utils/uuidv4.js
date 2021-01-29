/* eslint-disable no-bitwise */

function uuidv4() {
	let seed = Date.now();

	const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (seed + Math.random() * 16) % 16 | 0;
		seed = Math.floor(seed / 16);
		return (c === 'x' ? r : r & (0x3 | 0x8)).toString(16);
	});

	return uuid;
}

export default uuidv4;
