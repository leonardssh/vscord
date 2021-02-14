import { window } from 'vscode';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

const outputChannel = window.createOutputChannel('VSCord');

export const logMessage = (message: string, logLevel: LogLevel) => {
	const timestamp = new Date().toLocaleDateString();
	outputChannel.appendLine(`["${logLevel}" - ${timestamp}] ${message}`);
};

export const logInfo = (message: string) => {
	logMessage(message, 'INFO');
};

export const logWarning = (message: string) => {
	logMessage(message, 'WARN');
};

export const logError = (message: string, error?: Error | string) => {
	logMessage(message, 'ERROR');

	if (typeof error === 'string') {
		outputChannel.appendLine(error);
	} else if (error?.message || error?.stack) {
		if (error?.message) {
			logMessage(error.message, 'ERROR');
		}

		if (error?.stack) {
			outputChannel.appendLine(error.stack);
		}
	}
};
