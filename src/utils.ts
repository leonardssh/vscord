import { exec } from 'child_process';
import { basename, parse } from 'path';
import { TextDocument } from 'vscode';
import { KNOWN_EXTENSIONS, KNOWN_LANGUAGES } from './constants';

export const toLower = (str: string) => str.toLocaleLowerCase();
export const toUpper = (str: string) => str.toLocaleUpperCase();
export const toTitle = (str: string) =>
	toLower(str).replace(/^\w/, (c) => toUpper(c));

export function resolveFileIcon(document: TextDocument) {
	const filename = basename(document.fileName);
	const findKnownExtension = Object.keys(KNOWN_EXTENSIONS).find((key) => {
		if (filename.endsWith(key)) {
			return true;
		}

		const match = /^\/(.*)\/([mgiy]+)$/.exec(key);
		if (!match) {
			return false;
		}

		const regex = new RegExp(match[1], match[2]);
		return regex.test(filename);
	});

	const findKnownLanguage = KNOWN_LANGUAGES.find(
		(key) => key.language === document.languageId
	);

	const fileIcon = findKnownExtension
		? KNOWN_EXTENSIONS[findKnownExtension]
		: findKnownLanguage
		? findKnownLanguage.image
		: null;

	return typeof fileIcon === 'string' ? fileIcon : fileIcon?.image ?? 'text';
}

export async function getGitRepo(uri: string): Promise<string | null> {
	const { dir } = parse(uri);

	return new Promise((resolve, reject) => {
		exec(
			`git config --get remote.origin.url`,
			{ cwd: dir },
			// https://git-scm.com/docs/git-check-ignore#_exit_status
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			(error: Error & { code?: 0 | 1 | 128 }, stdout) => {
				if (error && error.code !== 0 && error.code !== 1) {
					reject(error);
					return;
				}

				let repo = null;

				if (stdout.length) {
					if (stdout.startsWith('git@') || stdout.startsWith('ssh://')) {
						repo = stdout
							.replace('ssh://', '')
							.replace(':', '/')
							.replace('git@', 'https://')
							.replace('.git', '')
							.replace('\n', '');
					} else {
						repo = stdout
							.replace(/(https:\/\/)([^@]*)@(.*?$)/, '$1$3')
							.replace('.git', '')
							.replace('\n', '');
					}
				}

				resolve(repo);
			}
		);
	});
}
