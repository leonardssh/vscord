<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=LeonardSSH.vscord" target="_blank" rel="noopener noreferrer">
    <img width="256" src="https://i.imgur.com/n7ieZfW.png" alt="VSCord Logo">
  </a>
</p>

<br>

<p>
    <p align="center">
        <a href="https://marketplace.visualstudio.com/items?itemName=LeonardSSH.vscord">
            <img alt="Visual Studio Marketplace Version" src="https://img.shields.io/visual-studio-marketplace/v/LeonardSSH.vscord?label=Visual%20Studio%20Marketplace" />
        </a>
        <a href="https://marketplace.visualstudio.com/items?itemName=LeonardSSH.vscord">
            <img alt="Visual Studio Marketplace Downloads" src="https://img.shields.io/visual-studio-marketplace/d/LeonardSSH.vscord" />
        </a>
        <a href="https://marketplace.visualstudio.com/items?itemName=LeonardSSH.vscord">
            <img alt="Visual Studio Marketplace Installs" src="https://img.shields.io/visual-studio-marketplace/i/LeonardSSH.vscord" />
        </a>
        <a href="https://marketplace.visualstudio.com/items?itemName=LeonardSSH.vscord">
            <img alt="Visual Studio Marketplace Rating" src="https://img.shields.io/visual-studio-marketplace/r/LeonardSSH.vscord">
        </a>
    </p>
    <p align="center">
		<a href="https://open-vsx.org/extension/LeonardSSH/vscord">
			<img alt="Open VSX Version" src="https://img.shields.io/open-vsx/v/LeonardSSH/vscord?label=OpenVSX%20Marketplace">
		</a>
		<a href="https://open-vsx.org/extension/LeonardSSH/vscord">
			<img alt="Open VSX Downloads" src="https://img.shields.io/open-vsx/dt/LeonardSSH/vscord">
		</a>
		<a href="https://open-vsx.org/extension/LeonardSSH/vscord">
			<img alt="Open VSX Rating" src="https://img.shields.io/open-vsx/rating/LeonardSSH/vscord">
		</a>
	</p>
    <p align="center">
        <a href="https://github.com/leonardssh/vscord/actions/workflows/CI.yml">
            <img alt="Continuous Integration" src="https://github.com/leonardssh/vscord/actions/workflows/CI.yml/badge.svg" />
        </a>
        <a href="https://gitter.im/LeonardSSH/vscord-support?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge">
            <img alt="Gitter" src="https://img.shields.io/badge/gitter-support chat-green?color=40aa8b" />
        </a>
    </p>
    <p align="center">
        <a href="https://github.com/leonardssh/vscord/actions/workflows/CD.yml">
            <img alt="Continuous Delivery" src="https://github.com/leonardssh/vscord/actions/workflows/CD.yml/badge.svg" />
        </a>
    </p>
</p>

<br>

# VSCord

Highly customizable [Discord Rich Presence](https://discord.com/rich-presence) extension for [Visual Studio Code](https://code.visualstudio.com/)

> Remember to 🌟 this GitHub if you 💖 it.

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
4. Commit your changes, and push them.
5. Submit a Pull Request [here](https://github.com/LeonardSSH/vscord/pulls)!

## 👨‍💻 Adding a new language

We have a guide for adding a new language [here](/ADDING_LANGUAGE.md)!

## 🎉 Thanks

-   [discordjs](https://github.com/discordjs/) - Creator of Discord RPC Client
-   [iCrawl](https://github.com/iCrawl) - Creator of [discord-vscode](https://github.com/iCrawl/discord-vscode)
-   [Satoqz](https://github.com/Satoqz) - Creator of [vscode-discord](https://github.com/Satoqz/vscode-discord/)

_Much of the code in this repository is based on [iCrawl/discord-vscode](https://github.com/iCrawl/discord-vscode) & [Satoqz/vscode-discord](https://github.com/Satoqz/vscode-discord). This extension would not exist without them._

## 📋 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
