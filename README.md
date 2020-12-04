<p align="center">
    <img src="https://i.imgur.com/ME8jLXS.png" alt="Icon" align="center" width="256">
<p>

<h3 align="center">
    😎 Another awesome and fully customizable VS Code extension to get Discord Rich Presence integration.
</h3>

<div align="center">
  <p>
    <a href="https://marketplace.visualstudio.com/items?itemName=LeonardSSH.vscord">
        <img src="https://img.shields.io/visual-studio-marketplace/v/LeonardSSH.vscord?color=6477C1&style=flat-square" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=LeonardSSH.vscord">
        <img src="https://img.shields.io/visual-studio-marketplace/d/LeonardSSH.vscord?color=6477C1&style=flat-square" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=LeonardSSH.vscord">
        <img src="https://img.shields.io/visual-studio-marketplace/i/LeonardSSH.vscord?color=6477C1&style=flat-square" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=LeonardSSH.vscord">
        <img src="https://vsmarketplacebadge.apphb.com/rating-short/LeonardSSH.vscord.svg?color=6477C1&style=flat-square" />
    </a>
  </p>
</div>

---

Remember to 🌟 this Github if you 💖 it.

> **NOTE:** That is just an extension between **[iCrawl's extension](https://github.com/iCrawl/discord-vscode)** and **[Satoqz's extension](https://github.com/Satoqz/vscode-discord)** with a few small changes, bug fixs and new pretty icons.

## 📌 Features

-   Shows what you're working on in VSCode
-   Shows the amount of problems in your workspace
-   Shows the number of lines in your file and which line you're editing
-   Respects Discords 15sec limit when it comes to updating your status
-   Support for over 130 of the most popular languages
-   Enable/Disable RPC for individual workspaces
-   Custom string support
-   Stable or Insiders build detection
-   Debug mode detection
-   Easily manually reconnect to Discord Gateway

> All texts is fully customizable using variables and a multitude of config options

![a1](https://i.imgur.com/9kjM9rr.png)
![a2](https://i.imgur.com/v9tgyHN.png)
![a3](https://i.imgur.com/mvecFVN.png)
![a4](https://i.imgur.com/3GZtZeP.png)

## 📥 Installation

### Prerequisites

**[Visual Studio Code](https://code.visualstudio.com/)** or **[Visual Studio Code Insiders](https://code.visualstudio.com/insiders/)**

### Install

Launch VS Code Quick Open (Ctrl+P), paste the following command, and press enter.

```
ext install LeonardSSH.vscord
```

**OR**

Use the **[Extension Marketplace](https://code.visualstudio.com/docs/editor/extension-gallery)**

![a4](https://i.imgur.com/qMzox38.gif)

## 🤖 Commands

| Command          | Description                           |
| ---------------- | ------------------------------------- |
| `rpc.enable`     | Enables RPC in the current workspace  |
| `rpc.disable`    | Disables RPC in the current workspace |
| `rpc.disconnect` | Disconnects you from Discord Gateway  |
| `rpc.reconnect`  | Reconnects you to Discord Gateway     |

## 🔧 Settings

#### **VSCord.id**

Application ID. Change only if you known exactly what you're doing.

Default: `782685898163617802`

#### **VSCord.enabled**

Controls if the RPC should show across all workspaces.

Default: `true`

#### **VSCord.ignoreWorkspaces**

List of patterns to match workspace names that should prevent the extension from starting.

Default: `[]`

#### **VSCord.workspaceElapsedTime**

Controls if the RPC should display elapsed time for a workspace or a single file.

Default: `false`

#### **VSCord.checkIdle**

Whether or not to check if you are still active or idle and react accordingly.

Default: `true`

#### **VSCord.idleTimeout**

How long the window should be unfocused (in seconds) to either disable rich presence or display you as idle.

Default: `60`

#### **VSCord.idleText**

Custom string of the text displaying if you're idle when hovering over the small icon.

Default: `Idle`

#### **VSCord.detailsEditing**

Custom string for the details section of the rich presence.

Default: `{workspace} {problems}`

-   `{null}` will be replaced with an empty space
-   `{filename}` will be replaced with the current file name
-   `{dirname}` will get replaced with the folder name that has the current file
-   `{fulldirname}` will get replaced with the full directory name without the current file name
-   `{workspace}` will be replaced with the current workspace name, if any
-   `{workspaceFolder}` will be replaced with the currently accessed workspace folder, if any
-   `{workspaceAndFolder}` will be replaced with the currently accessed workspace and workspace folder like this: 'Workspace - WorkspaceFolder'
-   `{currentcolumn}` will get replaced with the current column of the current line
-   `{currentline}` will get replaced with the current line number
-   `{totallines}` will get replaced with the total line number
-   `{problems}` will be replaced with the count of problems (warnings, errors) present in your workspace

#### **VSCord.detailsDebugging**

Custom string for the details section of the rich presence when debugging.

Default: `Debugging {filename}`

-   `{null}` will be replaced with an empty space
-   `{filename}` will be replaced with the current file name
-   `{dirname}` will get replaced with the folder name that has the current file
-   `{fulldirname}` will get replaced with the full directory name without the current file name
-   `{workspace}` will be replaced with the current workspace name, if any
-   `{workspaceFolder}` will be replaced with the currently accessed workspace folder, if any
-   `{workspaceAndFolder}` will be replaced with the currently accessed workspace and workspace folder like this: 'Workspace - WorkspaceFolder'
-   `{currentcolumn}` will get replaced with the current column of the current line
-   `{currentline}` will get replaced with the current line number
-   `{totallines}` will get replaced with the total line number
-   `{problems}` will be replaced with the count of problems (warnings, errors) present in your workspace

#### **VSCord.detailsIdle**

Custom string for the details section of the rich presence when idling.

Default: `Idling`

-   `{null}` will be replaced with an empty space

#### **VSCord.detailsViewing**

Custom string for the details section of the rich presence when viewing.

Default: `In {workspace} {problems}`

-   `{null}` will be replaced with an empty space
-   `{filename}` will be replaced with the current file name
-   `{dirname}` will get replaced with the folder name that has the current file
-   `{fulldirname}` will get replaced with the full directory name without the current file name
-   `{workspace}` will be replaced with the current workspace name, if any
-   `{workspaceFolder}` will be replaced with the currently accessed workspace folder, if any
-   `{workspaceAndFolder}` will be replaced with the currently accessed workspace and workspace folder like this: 'Workspace - WorkspaceFolder'
-   `{currentcolumn}` will get replaced with the current column of the current line
-   `{currentline}` will get replaced with the current line number
-   `{totallines}` will get replaced with the total line number
-   `{problems}` will be replaced with the count of problems (warnings, errors) present in your workspace

#### **VSCord.lowerDetailsEditing**

Custom string for the state section of the rich presence.

Default: `Working on {filename}:{currentline}:{currentcolumn}`

-   `{null}` will be replaced with an empty space
-   `{filename}` will be replaced with the current file name
-   `{dirname}` will get replaced with the folder name that has the current file
-   `{fulldirname}` will get replaced with the full directory name without the current file name
-   `{workspace}` will be replaced with the current workspace name, if any
-   `{workspaceFolder}` will be replaced with the currently accessed workspace folder, if any
-   `{workspaceAndFolder}` will be replaced with the currently accessed workspace and workspace folder like this: 'Workspace - WorkspaceFolder'
-   `{currentcolumn}` will get replaced with the current column of the current line
-   `{currentline}` will get replaced with the current line number
-   `{totallines}` will get replaced with the total line number
-   `{problems}` will be replaced with the count of problems (warnings, errors) present in your workspace

#### **VSCord.lowerDetailsDebugging**

Custom string for the state section of the rich presence when debugging

Default: `Debugging: {workspace}`

-   `{null}` will be replaced with an empty space
-   `{filename}` will be replaced with the current file name
-   `{dirname}` will get replaced with the folder name that has the current file
-   `{fulldirname}` will get replaced with the full directory name without the current file name
-   `{workspace}` will be replaced with the current workspace name, if any
-   `{workspaceFolder}` will be replaced with the currently accessed workspace folder, if any
-   `{workspaceAndFolder}` will be replaced with the currently accessed workspace and workspace folder like this: 'Workspace - WorkspaceFolder'
-   `{currentcolumn}` will get replaced with the current column of the current line
-   `{currentline}` will get replaced with the current line number
-   `{totallines}` will get replaced with the total line number
-   `{problems}` will be replaced with the count of problems (warnings, errors) present in your workspace

#### **VSCord.lowerDetailsIdle**

Custom string for the state section of the rich presence when idling.

Default: `Idling`

-   `{null}` will be replaced with an empty space.

#### **VSCord.lowerDetailsViewing**

Custom string for the state section of the rich presence when viewing.

Default: `Viewing {filename}`

-   `{null}` will be replaced with an empty space
-   `{filename}` will be replaced with the current file name
-   `{dirname}` will get replaced with the folder name that has the current file
-   `{fulldirname}` will get replaced with the full directory name without the current file name
-   `{workspace}` will be replaced with the current workspace name, if any
-   `{workspaceFolder}` will be replaced with the currently accessed workspace folder, if any
-   `{workspaceAndFolder}` will be replaced with the currently accessed workspace and workspace folder like this: 'Workspace - WorkspaceFolder'
-   `{currentcolumn}` will get replaced with the current column of the current line
-   `{currentline}` will get replaced with the current line number
-   `{totallines}` will get replaced with the total line number
-   `{problems}` will be replaced with the count of problems (warnings, errors) present in your workspace

#### **VSCord.lowerDetailsNotFound**

Custom string for the state section of the rich presence when no workspace is found.

Default: `No workspace.`

-   `{null}` will be replaced with an empty space
-   `{currentline}` will get replaced with the current line number
-   `{totallines}` will get replaced with the total line number

#### **VSCord.largeImage**

Custom string for the largeImageText section of the rich presence.

Default: `Editing a {LANG} file`

-   `{lang}` will be replaced with the lowercased language ID
-   `{Lang}` will be replaced with the language ID, first letter being uppercase
-   `{LANG}` will be replaced with the uppercased language ID

#### **VSCord.largeImageIdle**

Custom string for the largeImageText section of the rich presence when idling.

Default: `Idling`

#### **VSCord.smallImage**

Custom string for the smallImageText section of the rich presence.

Default: `{appname}`

-   `{appname}` will get replaced with the current Visual Studio Code version.

#### **VSCord.showProblems**

Controls if the RPC should show the count of problems (warnings, errors) present in your workspace.

Default: `true`

#### **VSCord.problemsText**

Custom string of the text displaying the amount of problems in your workspace.

Default: `- {count} problems found`

-   `{count}` will be replaced by the respective amount of problems

## 👨‍💻 Contributing

To contribute to this repository, feel free to create a new fork of the repository and submit a pull request.

1. Fork / Clone and select the `main` branch.
2. Create a new branch in your fork.
3. Make your changes.
4. Commit your changes, and push them.
5. Submit a Pull Request [here](https://github.com/LeonardSSH/vscord/pulls)!

## 📋 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
