/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Disposable, languages, WorkspaceConfiguration } from 'vscode';

import type Activity from './Activity';

export class Listener {
	private disposables: Disposable[] = [];

	private config: WorkspaceConfiguration;

	constructor(private activity: Activity) {
		this.config = activity.config;
	}

	public listen() {
		this.dispose();

		const diagnostictsChange = languages.onDidChangeDiagnostics;

		if (this.config.get<boolean>('showProblems')) {
			this.disposables.push(diagnostictsChange(() => this.activity.onDiagnosticsChange()));
		}
	}

	public dispose() {
		this.disposables.forEach((disposable: Disposable) => disposable.dispose());
	}
}
