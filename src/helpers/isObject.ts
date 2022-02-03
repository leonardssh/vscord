export const isObject = (value: any) => {
	return value !== null && (typeof value === 'object' || typeof value === 'function');
};
