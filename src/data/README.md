# Adding Language

There's currently two value that store information for language, that is `KNOWN_LANGUAGES` and `KNOWN_EXTENSIONS`.
It's not nessecary to fill both field, only one is needed, but you can fill both field.

## KNOWN_LANGUAGES

`KNOWN_LANGUAGES` is a map of Language ID and icon, it's usually specified by extenstion developer who add support for that specific language.

### Finding Language ID

You can find the ID by doing the following.

-   CTRL + SHIFT + P
-   Change Language Mode
-   Search for the language
-   Next to the language mode, in the bracket is the id for the language

For example, in the Language Mode menu, when selecting `C++` it shows `C++ (cpp)`, that mean that `cpp` is the language id

### Example

```ts
/*
K: Language ID
V: Icon
*/
const KNOWN_LANGUAGES: Map<string, string> = {
    cpp: "cpp",
    // Language with ID "cpp" is linked to image "cpp" in "assets" folder
    astro: "astro",
    // Language with ID "astro" is linked to image "astro" in "assets" folder
    jsonc: "jsoncomments"
    // Language with ID "jsonc" is linked to image "jsoncomments" in "assets" folder
};
```

## KNOWN_EXTENSIONS

This is used when there's no matching id in the `KNOWN_LANGUAGES`, or when extenstion to that language id is not installed, it will check if current file ends with the specified value

### Example

```ts
/*
K: RegEx to test at the end of string
V: Icon
*/
const KNOWN_EXTENSIONS: Map<string, string> = {
    ".cpp": "cpp",
    // File that end with ".cpp" is linked to image "cpp" in "assets" folder
    ".cc": "cpp",
    // File that end with ".cc" is linked to image "cpp" in "assets" folder
    "/\\.c[+px]{2}$|\\.cc$/i": "cpp"
    // File that end with this regex is linked to image "cpp" in "assets" folder
};
```
