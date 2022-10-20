# ⚠️ BREAKING CHANGES ⚠️

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
            <img alt="Visual Studio Marketplace Rating" src="https://vsmarketplacebadge.apphb.com/rating-short/LeonardSSH.vscord.svg" />
        </a>
		<a href="https://github.com/LeonardSSH/vscord/actions/workflows/cd-vs-marketplace.yml">
			<img alt="CD - Visual Studio Marketplace" src="https://img.shields.io/github/workflow/status/leonardssh/vscord/CD%20-%20Visual%20Studio%20Marketplace?label=CD%20-%20Visual%20Studio%20Marketplace">
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
		<a href="https://github.com/LeonardSSH/vscord/actions/workflows/cd-open-vsx.yml">
			<img alt="CD - Open VSX Registry" src="https://img.shields.io/github/workflow/status/leonardssh/vscord/CD%20-%20Open%20VSX%20Registry?label=CD%20-%20Open%20VSX%20Registry">
		</a>
	</p>
    <p align="center">
        <a href="https://gitter.im/LeonardSSH/vscord-support?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge">
            <img src="https://img.shields.io/badge/gitter-support chat-green?color=40aa8b" />
        </a>
    </p>
</p>

<br>

# Discord Rich Presence

Remember to 🌟 this GitHub if you 💖 it.

> Fully customizable VS Code extension to get Discord Rich Presence integration

## 📌 Features

-   Shows what you're working on in Visual Studio Code
-   Switch between 3 IDE names (`Code`, `Visual Studio Code` and `VSCodium`) [(preview)](https://streamable.com/apjd4g)
-   Highly customizable using the extension settings
-   Shows the amount of problems in your workspace
-   Shows the number of lines in your file and which line you're editing
-   Shows the git repository and branch you are working on
-   Shows the size of the file you are working on
-   Respects Discord's 15 seconds ratelimit when updating your status
-   Support for over 130+ of the most popular languages
-   Enable/Disable RPC for individual workspaces
-   Stable or Insiders build detection
-   Debug mode detection
-   Easily manually reconnect to Discord Gateway
-   Idle indication when you tab out for a while
-   Button that sends you to the GitHub repository
-   flatpak/snapstore support

> All texts are fully customizable using variables and a multitude of config options

![1](https://i.imgur.com/LaB4TqM.png)
![2](https://i.imgur.com/yTFIFiK.png)
![3](https://i.imgur.com/5OOkKUW.png)

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

## 👨‍💻 Contributing

To contribute to this repository, feel free to create a new fork of the repository and submit a pull request.

1. Fork / Clone and select the `main` branch.
2. Create a new branch in your fork.
3. Make your changes.
4. Commit your changes, and push them.
5. Submit a Pull Request [here](https://github.com/LeonardSSH/vscord/pulls)!

## 👨‍💻 Adding a new language

To add a new language, you need to read "[Adding Language Data Guide](src/data/README.md)" and "[Adding Language Icon Guide](assets/icons/README.md)" first, then you can follow the Contributing steps above!

## 🎉 Thanks

-   [discordjs](https://github.com/discordjs/) - Creator of Discord RPC Client
-   [iCrawl](https://github.com/iCrawl) - Creator of [discord-vscode](https://github.com/iCrawl/discord-vscode)
-   [Satoqz](https://github.com/Satoqz) - Creator of [vscode-discord](https://github.com/Satoqz/vscode-discord/)

_Much of the code in this repository is based on [iCrawl/discord-vscode](https://github.com/iCrawl/discord-vscode) & [Satoqz/vscode-discord](https://github.com/Satoqz/vscode-discord). This extension would not exist without them._

## 📋 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
