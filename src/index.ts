import Logger from './structures/Logger';

export const activate = () => {
	Logger.log('Extension activated, trying to connect to Discord Gateway.');
};

export const deactivate = () => {
	Logger.log('Extension deactivated, trying to disconnect from Discord Gateway.');
};
