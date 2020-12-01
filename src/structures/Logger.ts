import { OutputChannel, window } from 'vscode';

// eslint-disable-next-line
export default class Logger {
	private static output?: OutputChannel;

	public static log(message: string) {
		if (!this.output) {
			this.output = window.createOutputChannel('RPC');
		}

		this.output.appendLine(message);
	}
}
