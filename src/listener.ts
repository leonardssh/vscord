import { debug, Disposable, languages, window, WindowState, workspace } from 'vscode';
import { getConfig } from './config';
import { CONFIG_KEYS } from './constants';
import { sendActivity, toggleIdling } from './extension';
import throttle from 'lodash-es/throttle';
import { onDiagnosticsChange } from './activity';

let listeners: Disposable[] = [];

const config = getConfig();

export function listen() {
	const fileSwitch = window.onDidChangeActiveTextEditor;
	const fileEdit = workspace.onDidChangeTextDocument;
	const debugStart = debug.onDidStartDebugSession;
	const debugEnd = debug.onDidTerminateDebugSession;
	const diagnosticsChange = languages.onDidChangeDiagnostics;
	const changeWindowState = window.onDidChangeWindowState;

	listeners.push(
		fileSwitch(() => sendActivity({ isViewing: true })),
		fileEdit(throttle(() => sendActivity({ isViewing: false }), 2000)),
		debugStart(() => sendActivity()),
		debugEnd(() => sendActivity())
	);

	if (config[CONFIG_KEYS.ShowProblems]) {
		listeners.push(diagnosticsChange(() => onDiagnosticsChange()));
	}

	if (config[CONFIG_KEYS.CheckIdle]) {
		listeners.push(changeWindowState((e: WindowState) => toggleIdling(e)));
	}
}

export function cleanUp() {
	listeners.forEach((listener: Disposable) => listener.dispose());
	listeners = [];
}
