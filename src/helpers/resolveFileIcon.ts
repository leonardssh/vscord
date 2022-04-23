import { TextDocument, Uri } from 'vscode';
import { basename } from 'path';
import { getConfig } from '../config';
import { CONFIG_KEYS, KNOWN_EXTENSIONS, KNOWN_LANGUAGES } from '../constants';

export const toLower = (str: string) => str.toLocaleLowerCase();
export const toUpper = (str: string) => str.toLocaleUpperCase();
export const toTitle = (str: string) => toLower(str).replace(/^\w/, (c) => toUpper(c));

export const getFileIcon = (name: string) =>
	`https://raw.githubusercontent.com/LeonardSSH/vscord/main/assets/icons/${name}.png`;

function getKnownExtension(filename: string) {
	return Object.keys(KNOWN_EXTENSIONS).find((key) => {
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
}

export function resolveFileIconByUri(uri: Uri) {
	// since there is no way to retrieve the languageId from a URI,
	// the fileIcon is solely resolved by known extensions.

	const filename = basename(uri.path);
	const findKnownExtension = getKnownExtension(filename);

	const knownExtension = findKnownExtension
		? (KNOWN_EXTENSIONS as { [key: string]: { image: string } })[findKnownExtension]
		: null;

	return typeof knownExtension === 'string' ? knownExtension : knownExtension?.image ?? 'text';
}

export function resolveFileIcon(document: TextDocument) {
	const config = getConfig();
	const filename = basename(document.fileName);
	const findKnownExtension = getKnownExtension(filename);

	const areLanguagesPrioritized = config[CONFIG_KEYS.PrioritizeLanguagesOverExtensions];
	const findKnownLanguage = KNOWN_LANGUAGES.find((key) => key.language === document.languageId);

	const knownExtension = findKnownExtension
		? (KNOWN_EXTENSIONS as { [key: string]: { image: string } })[findKnownExtension]
		: findKnownLanguage
		? findKnownLanguage.image
		: null;

	const knownLanguage = findKnownLanguage ? findKnownLanguage.image : knownExtension;
	const fileIcon = areLanguagesPrioritized ? knownLanguage : knownExtension;

	return typeof fileIcon === 'string' ? fileIcon : fileIcon?.image ?? 'text';
}
