import { window } from "vscode";

const outputChannel = window.createOutputChannel("VSCord");

export const enum LogLevel {
    Info = "INFO",
    Warn = "WARN",
    Error = "ERROR"
}

const logMessage = (logLevel: LogLevel, ...messageList: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const messageToLog = [];

    for (const message of messageList) {
        if (typeof message === "string") messageToLog.push(message);
        else if (message instanceof Error) messageToLog.push(message.stack ?? message.message);
        else {
            try {
                messageToLog.push(JSON.stringify(message, null, 2));
            } catch (ignore) {
                messageToLog.push(message);
            }
        }
    }

    outputChannel.appendLine(`[${timestamp}] [${logLevel}] ${messageToLog.join(" ")}`);
};

export const logInfo = (...message: any) => void logMessage(LogLevel.Info, ...message);

export const logWarn = (...message: any) => void logMessage(LogLevel.Warn, ...message);

export const logError = (...message: any) => void logMessage(LogLevel.Error, ...message);
