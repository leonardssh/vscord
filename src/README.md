<div align="center">

# VSCord - Developer Guide

Development documentation for the [VSCord](https://github.com/LeonardSSH/vscord) extension.

</div>

<br />

## 🚀 Getting Started

This guide covers how to set up your environment, build, and run the extension locally.

## 🛠️ Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (Node Package Manager)

## 📥 Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/LeonardSSH/vscord.git
    cd vscord
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## 💻 Running in Development Mode

To run the extension in development mode with hot-reloading (watch mode):

1.  Open the project in **Visual Studio Code**.
2.  Press **F5** to start debugging. This will compile the extension and open a new **Extension Development Host** window.

Alternatively, you can run the watch script manually in your terminal if you prefer:

```bash
npm run watch
```

## 🏗️ Building the Extension

To compile the source code:

```bash
npm run compile
```

This runs type checking, linting, and builds the project using `esbuild`.

## 📦 Packaging

To create a `.vsix` package for distribution or manual installation:

```bash
npm run package
```

or

```bash
vsce package
```

## 🧪 Testing

We recommend running lint checks before pushing changes:

```bash
npm run lint
```

## 🔍 Development Notes

- **Source Code**: All source code is located in the `src` directory.
- **Entry Point**: `src/extension.ts` is the main entry point of the extension.
- **Configuration**: Settings are defined in `package.json` under `contributes.configuration` and handled in `src/config.ts`.
