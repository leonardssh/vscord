# Adding a Programming Language

Adding a Programming Language to the extension is easy, you can either add it to the repository OR define it in `vscord.additionalFileMapping`.

To make the language appear you need to add it extension to the language data json or `vscord.additionalFileMapping`, then to make icon appear you need to add it to [assets/icons/](/assets/icons/).

Data for Programming Language will be located in [src/data/languages.json](/src/data/languages.json)
Icon for Programming Language will be located in [assets/icons/](/assets/icons/)

## Adding Language Data

There's currently two value that store information for language, that is `KNOWN_LANGUAGES` and `KNOWN_EXTENSIONS`.
It's not necessary to fill both field, only one is needed, but you can fill both field.<br>

If possible, please also sort the key by alphabetical order!

### KNOWN_LANGUAGES

`KNOWN_LANGUAGES` is a [record](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) of Language ID and icon.
It's usually specified by extension developer who add support for that specific language.

#### Finding Language ID

You can find the ID by doing the following.

-   CTRL + SHIFT + P
-   Change Language Mode
-   Search for the language
-   Next to the language mode, in the bracket is the id for the language

For example, in the Language Mode menu, when selecting `C++` it shows `C++ (cpp)`, that mean that `cpp` is the language id

#### Example

```ts
/*
K: Language ID
V: Icon
*/
const KNOWN_LANGUAGES: Record<string, string> = {
    cpp: "cpp",
    // Language with ID "cpp" is linked to image "cpp" in "assets" folder
    astro: "astro",
    // Language with ID "astro" is linked to image "astro" in "assets" folder
    jsonc: "jsoncomments"
    // Language with ID "jsonc" is linked to image "jsoncomments" in "assets" folder
};
```

### KNOWN_EXTENSIONS

This is used when there's no matching id in the `KNOWN_LANGUAGES`, or when extension for that language id is not installed, it will check if current file ends with the specified value

#### Example

```ts
/*
K: RegEx to test at the end of string
V: Icon
*/
const KNOWN_EXTENSIONS: Record<string, string> = {
    ".cpp": "cpp",
    // File that end with ".cpp" is linked to image "cpp" in "assets" folder
    ".cc": "cpp",
    // File that end with ".cc" is linked to image "cpp" in "assets" folder
    "/\\.c[+px]{2}$|\\.cc$/i": "cpp"
    // File that end with this regex is linked to image "cpp" in "assets" folder
};
```

## Adding a new Language Icon

When adding an icon for a language, please read the information below before doing so!

### Requirements

-   It should have a size of 1024x1024.
-   Please use PNG file format.
-   Recommend logo size is 512x512, if it's too small you can make it bigger.
-   We recommend using HSV instead of RGB when working with the background color, and please don't use plain color as background.
-   You should use the official logo of the language UNLESS it's necessary to use other icon (logo not minimal, can't find transparent version)
-   The icon should be minimalist.

### Note

If you can't make an icon, then that's fine! Just add the language name to the list in next section! future contributor might be able to work on it!

### Missing Icon List

Use the following format `(Language Name) ((Language Icon.png)) ([Link to language website / information about the language])` where `()` is required, `[]` is optional

Example: `C++ (cpp.png) (https://en.wikipedia.org/wiki/C%2B%2B)`

#### List:

-   Mojo ([mojo.png](https://modular-mojotools.gallerycdn.vsassets.io/extensions/modular-mojotools/vscode-mojo/0.2.1/1694073556578/Microsoft.VisualStudio.Services.Icons.Default)) [Website](https://www.modular.com/mojo)
