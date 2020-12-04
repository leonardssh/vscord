/* eslint-disable prefer-destructuring */
import { workspace, TextDocument } from 'vscode';
import { basename } from 'path';

import type { VSCordConfig } from '../types';

import lang from '../language/languages.json';

const knownExtensions: { [key: string]: { image: string } } = lang.knownExtensions;
const knownLanguages: string[] = lang.knownLanguages;

export function getConfig(): VSCordConfig {
	return workspace.getConfiguration('VSCord') as any;
}

export function resolveIcon(document: TextDocument) {
	const filename = basename(document.fileName);

	const icon =
		knownExtensions[
			Object.keys(knownExtensions).find((key) => {
				if (filename.endsWith(key)) {
					return true;
				}

				const match = /^\/(.*)\/([mgiy]+)$/.exec(key);
				if (!match) {
					return false;
				}

				const regex = new RegExp(match[1], match[2]);
				return regex.test(filename);
			})!
		] ?? (knownLanguages.includes(document.languageId) ? document.languageId : null);

	return icon ? icon.image ?? icon : 'txt';
}
