import { window } from 'vscode';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'NONE';

const outputChannel = window.createOutputChannel('VSCord');

export class LoggingService {
	private logLevel: LogLevel = 'INFO';

	public setOutputLevel(logLevel: LogLevel) {
		this.logLevel = logLevel;
	}

	public logInfo(message: string) {
		if (this.logLevel !== 'INFO') {
			return;
		}

		this.logMessage(message, 'INFO');
	}

	public logWarning(message: string) {
		if (this.logLevel !== 'WARN') {
			return;
		}

		this.logMessage(message, 'WARN');
	}

	public logError(message: string, error?: Error | string) {
		if (this.logLevel === 'NONE') {
			return;
		}

		this.logMessage(message, 'ERROR');

		if (typeof error === 'string') {
			outputChannel.appendLine(error);
		} else if (error?.message || error?.stack) {
			if (error?.message) {
				this.logMessage(error.message, 'ERROR');
			}

			if (error?.stack) {
				outputChannel.appendLine(error.stack);
			}
		}
	}

	public show() {
		outputChannel.show();
	}

	private logMessage(message: string, logLevel: LogLevel) {
		const title = new Date().toLocaleDateString();
		outputChannel.appendLine(`["${logLevel}" - ${title}] ${message}`);
	}
}
