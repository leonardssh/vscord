import * as vscode from 'vscode';

const outputChannel = vscode.window.createOutputChannel('VSCord');

export default class Logger {
  static log(message: string): void {
    outputChannel.appendLine(message);
  }
}
