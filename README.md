<div align="center">

[<img width="256" alt="VSCord Logo" src="https://i.imgur.com/n7ieZfW.png" />][vsmp-link]

<br />

[![Visual Studio Marketplace Version][shield-vsmp-version]][vsmp-link]
[![Visual Studio Marketplace Downloads][shield-vsmp-downloads]][vsmp-link]
[![Visual Studio Marketplace Installs][shield-vsmp-installs]][vsmp-link]
[![Visual Studio Marketplace Rating][shield-vsmp-rating]][vsmp-link]

[![Open VSX Version][shield-ovsx-version]][ovsx-link]
[![Open VSX Downloads][shield-ovsx-downloads]][ovsx-link]
[![Open VSX Rating][shield-ovsx-rating]][ovsx-link]

[![Continuous Integration][shield-workflows-ci]][github-workflows-ci]
[![Gitter Support Chat][shield-gitter-support]][gitter-vscord-support]

[![Continuous Delivery][shield-workflows-cd]][github-workflows-cd]

</div>

<br />

# VSCord

Highly customizable [Discord Rich Presence](https://discord.com/rich-presence) extension for [Visual Studio Code](https://code.visualstudio.com/)

> Remember to 🌟 this GitHub if you 💖 it.

## Disclaimer

This extension does not work with snapstore / flatpak version of VSCode, please use the official version from the VSCode website!

## 📌 Features

-   Shows what you're working on!
-   Switch between 3 IDE names (`Code`, `Visual Studio Code` and `VSCodium`) or a custom one if you wish!
-   Packed with 60+ extension settings!
-   Tons of variable to use!
-   Support for over 130+ of the most popular languages!
-   Support custom images (using HTTP link)
-   Support custom button link!
-   Support flatpak / snapstore version of Discord!
-   Detect when you are Debugging!
-   Detect when you are using the [Insiders build](https://code.visualstudio.com/insiders/)!
-   Detect when you are Idling!

## 👀 Preview

![1](https://i.imgur.com/LaB4TqM.png)
![2](https://i.imgur.com/yTFIFiK.png)
![3](https://i.imgur.com/5OOkKUW.png)

## 📥 Installation

Launch VS Code Quick Open (Ctrl+P), paste the following command, and press enter.

```
ext install LeonardSSH.vscord
```

**OR**

Use the **[Extension Marketplace](https://code.visualstudio.com/docs/editor/extension-gallery)**

![a4](https://i.imgur.com/qMzox38.gif)

## ⚙️ Configuration

The following variables will be replaced with the respective value in custom strings.<br>

| Variable                         | Value                                                             |
| -------------------------------- | ----------------------------------------------------------------- |
| `{app_name}`                     | current editor name                                               |
| `{app_id}`                       | editor name that's suitable for using inside url                  |
| `{file_name}`                    | name of the file                                                  |
| `{file_extension}`               | extension of the file                                             |
| `{file_size}`                    | size of the file                                                  |
| `{folder_and_file}`              | folder and file name                                              |
| `{relative_file_path}`           | filepath relative to the workspace folder                         |
| `{directory_name}`               | directory name                                                    |
| `{full_directory_name}`          | full directory name                                               |
| `{workspace}`                    | name of the workspace                                             |
| `{workspace_folder}`             | name of the workspace folder                                      |
| `{workspace_and_folder}`         | name of the workspace and folder                                  |
| `{lang}` \| `{Lang}` \| `{LANG}` | format of the lang string (css, Css, CSS)                         |
| `{problems}`                     | problems text defined in settings                                 |
| `{problems_count}`               | number of problems                                                |
| `{problems_count_errors}`        | number of problems that are errors                                |
| `{problems_count_warnings}`      | number of problems that are warnings                              |
| `{problems_count_infos}`         | number of problems that are infos                                 |
| `{problems_count_hints}`         | number of problems that are hints                                 |
| `{line_count}`                   | number of lines                                                   |
| `{current_line}`                 | current line                                                      |
| `{current_column}`               | current column                                                    |
| `{git_url}`                      | link to current git repository                                    |
| `{git_owner}`                    | current git repository owner                                      |
| `{git_provider}`                 | domain (including .com) to the provider of current git repository |
| `{git_repo}`                     | repository name for current repository                            |
| `{git_branch}`                   | current git branch                                                |
| `{empty}`                        | an empty space                                                    |

## 👨‍💻 Contributing

To contribute to this repository, feel free to create a new fork of the repository and submit a pull request.

1. Fork / Clone the `main` branch.
2. Create a new branch in your fork.
3. Make your changes.
4. Commit your changes and push them.
5. Submit a Pull Request [here](https://github.com/LeonardSSH/vscord/pulls)!

## 👨‍💻 Adding a new language

We have a guide for adding a new language [here](ADDING_LANGUAGE.md)!

## 🎉 Thanks

-   [discordjs](https://github.com/discordjs/) - Creator of Discord RPC Client
-   [iCrawl](https://github.com/iCrawl) - Creator of [discord-vscode](https://github.com/iCrawl/discord-vscode)
-   [Satoqz](https://github.com/Satoqz) - Creator of [vscode-discord](https://github.com/Satoqz/vscode-discord/)

_Much of the code in this repository is based on [iCrawl/discord-vscode](https://github.com/iCrawl/discord-vscode) & [Satoqz/vscode-discord](https://github.com/Satoqz/vscode-discord). This extension would not exist without them._

## 📋 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


[vsmp-link]:                https://marketplace.visualstudio.com/items?itemName=LeonardSSH.vscord
[ovsx-link]:                https://open-vsx.org/extension/LeonardSSH/vscord

[shield-vsmp-version]:      https://img.shields.io/visual-studio-marketplace/v/LeonardSSH.vscord?label=Visual%20Studio%20Marketplace
[shield-vsmp-downloads]:    https://img.shields.io/visual-studio-marketplace/d/LeonardSSH.vscord
[shield-vsmp-installs]:     https://img.shields.io/visual-studio-marketplace/i/LeonardSSH.vscord
[shield-vsmp-rating]:       https://img.shields.io/visual-studio-marketplace/r/LeonardSSH.vscord

[shield-ovsx-version]:      https://img.shields.io/open-vsx/v/LeonardSSH/vscord?label=OpenVSX%20Marketplace
[shield-ovsx-downloads]:    https://img.shields.io/open-vsx/dt/LeonardSSH/vscord
[shield-ovsx-rating]:       https://img.shields.io/open-vsx/rating/LeonardSSH/vscord

[github-workflows-ci]:      https://github.com/leonardssh/vscord/actions/workflows/CI.yml
[shield-workflows-ci]:      https://github.com/leonardssh/vscord/actions/workflows/CI.yml/badge.svg

[github-workflows-cd]:      https://github.com/leonardssh/vscord/actions/workflows/CD.yml
[shield-workflows-cd]:      https://github.com/leonardssh/vscord/actions/workflows/CD.yml/badge.svg

[gitter-vscord-support]:    https://gitter.im/LeonardSSH/vscord-support?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge
[shield-gitter-support]:    https://img.shields.io/badge/gitter-support%20chat-green?color=40aa8b
