import { isObject } from "./helpers/isObject";
import { window } from "vscode";

export const outputChannel = window.createOutputChannel("VSCord");

export const enum LogLevel {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}

const logMessage = (logLevel: LogLevel, ...messageList: unknown[]) => {
    const timestamp = new Date().toLocaleTimeString();
    const messageToLog = [];

    for (const message of messageList) {
        if (typeof message === "string") messageToLog.push(message);
        else if (message instanceof Error) messageToLog.push(message.stack ?? message.message);
        else if (isObject(message)) {
            try {
                messageToLog.push(JSON.stringify(message, null, 2));
            } catch (ignore) {
                messageToLog.push(message);
            }
        } else {
            messageToLog.push(message);
        }
    }

    outputChannel.appendLine(`[${timestamp}] [${logLevel}] ${messageToLog.join(" ")}`);
};

export const logInfo = (...message: unknown[]) => logMessage(LogLevel.INFO, ...message);

export const logWarn = (...message: unknown[]) => logMessage(LogLevel.WARN, ...message);

export const logError = (...message: unknown[]) => logMessage(LogLevel.ERROR, ...message);
