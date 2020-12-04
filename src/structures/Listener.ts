import { Disposable, languages } from 'vscode';
import { getConfig } from '../util/util';

import type Activity from './Activity';

export class Listener {
	private disposables: Disposable[] = [];

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	constructor(private activity: Activity) {}

	public listen() {
		this.dispose();

		const diagnostictsChange = languages.onDidChangeDiagnostics;

		const { showProblems } = getConfig();

		if (showProblems) {
			this.disposables.push(diagnostictsChange(() => this.activity.onDiagnosticsChange()));
		}
	}

	public dispose() {
		this.disposables.forEach((disposable: Disposable) => disposable.dispose());
	}
}
