import {
	Disposable,
	languages,
	window,
	workspace,
	debug,
	TextEditor,
	TextDocumentChangeEvent,
	ConfigurationChangeEvent,
	WindowState
} from 'vscode';
import { getConfig } from '../util/util';

import type { ActivityService } from './activity';

export class ListenerService implements Disposable {
	private disposables: Disposable[] = [];

	public constructor(private activityService: ActivityService) {}

	public listen() {
		this.dispose();

		const fileSwitch = window.onDidChangeActiveTextEditor;
		const fileEdit = workspace.onDidChangeTextDocument;
		const debugStart = debug.onDidStartDebugSession;
		const debugEnd = debug.onDidTerminateDebugSession;
		const configChange = workspace.onDidChangeConfiguration;
		const diagnostictsChange = languages.onDidChangeDiagnostics;
		const changeWindowState = window.onDidChangeWindowState;

		const { enabled, showProblems, checkIdle } = getConfig();

		if (enabled) {
			const onFileSwitch = fileSwitch((e: TextEditor | undefined) => this.activityService.onFileSwitch(e!));
			const onFileEdit = fileEdit((e: TextDocumentChangeEvent) => this.activityService.onFileEdit(e));
			const onDebugStart = debugStart(() => this.activityService.toggleDebug());
			const onDebugEnd = debugEnd(() => this.activityService.toggleDebug());
			const onConfigChange = configChange((e: ConfigurationChangeEvent) =>
				this.activityService.onConfigChange(e)
			);

			this.disposables.push(onFileSwitch, onFileEdit, onDebugStart, onDebugEnd, onConfigChange);

			if (showProblems) {
				this.disposables.push(diagnostictsChange(() => this.activityService.onDiagnosticsChange()));
			}

			if (checkIdle) {
				this.disposables.push(
					changeWindowState((e: WindowState) => this.activityService.onChangeWindowState(e))
				);
			}
		}
	}

	public dispose() {
		this.disposables.forEach((disposable: Disposable) => disposable.dispose());
	}
}
