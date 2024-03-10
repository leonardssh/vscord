import logger from './logger/logger';
import * as vscode from 'vscode';

// TODO: Use pino for logging, or write our own logger

export function activate(context: vscode.ExtensionContext) {
  logger.log('VSCord is activated, starting...');
}

export function deactivate() {}
