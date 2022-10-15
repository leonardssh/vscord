import { window } from "vscode";

const outputChannel = window.createOutputChannel("RPC");

export const enum LogLevel {
    Info = "INFO",
    Warn = "WARN",
    Error = "ERROR"
}

const logMessage = (message: string | Error, logLevel: LogLevel) => {
    const timestamp = new Date().toLocaleTimeString();

    if (typeof message === "string") {
        outputChannel.appendLine(`[${timestamp} - ${logLevel}] ${message}`);
    } else if (message instanceof Error) {
        outputChannel.appendLine(`[${timestamp} - ${logLevel}] ${message.message}`);

        if (message.stack) outputChannel.appendLine(`[${timestamp} - ${logLevel}] ${message.stack}`);
    } else if (typeof message === "object") {
        try {
            const json = JSON.stringify(message, null, 2);
            outputChannel.appendLine(`[${timestamp} - ${logLevel}] ${json}`);
        } catch {}
    }
};

export const logInfo = (message: string) => void logMessage(message, LogLevel.Info);

export const logWarn = (message: string) => void logMessage(message, LogLevel.Warn);

export const logError = (message: string) => void logMessage(message, LogLevel.Error);
