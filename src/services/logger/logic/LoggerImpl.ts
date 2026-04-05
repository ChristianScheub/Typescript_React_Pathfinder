// Import will be done via index.ts to avoid circular dependencies
// const fileDownloaderService is injected at runtime

export class LoggerImpl {
  private static readonly isMobile: boolean = false;
  private static readonly logKey: string = "app_logs";
  private static readonly isWorker: boolean = typeof window === 'undefined';
  private static logListeners: ((message: string, type: 'info' | 'warning' | 'error' | 'cache') => void)[] = [];

  private static getCallerFunctionName(): string {
    const stack = new Error().stack;

    if (stack) {
      const stackLines = stack.split("\n");

      for (let i = 2; i < stackLines.length; i++) {
        const line = stackLines[i].trim();
        if (!line.includes("Logger.")) {
          const match = /at (\S+)/.exec(line);
          if (match?.[1]) {
            return match[1];
          }
        }
      }
    }
    return "Unknown Function";
  }

  static subscribe(callback: (message: string, type: 'info' | 'warning' | 'error' | 'cache') => void): () => void {
    this.logListeners.push(callback);
    return () => {
      this.logListeners = this.logListeners.filter(cb => cb !== callback);
    };
  }

  // @ts-expect-error - Used dynamically in LoggerMethods
  private static notifyListeners(message: string, type: 'info' | 'warning' | 'error' | 'cache'): void {
    this.logListeners.forEach(cb => {
      try {
        cb(message, type);
      } catch {
        // Silently ignore listener errors to prevent breaking the app
      }
    });
  }

  static deleteLogs(){
    if (!this.isWorker) {
      LoggerImpl.saveLogsToLocalStorage([])
    }
    LoggerImpl.log("Logs deleted!");
  }

  // @ts-expect-error - Used dynamically in LoggerMethods
  private static formatMessage(message: string, emojiPrefix: string): string {
    return this.isMobile ? message : `${emojiPrefix} ${message}`;
  }

  private static getLogsFromLocalStorage(): string[] {
    if (this.isWorker) return [];
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
    const storedLogs = localStorage.getItem(this.logKey);
    return storedLogs ? JSON.parse(storedLogs) : [];
  }

  private static saveLogsToLocalStorage(logs: string[]): void {
    if (this.isWorker) return;
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    localStorage.setItem(this.logKey, JSON.stringify(logs));
  }
  
  static log(message: string): void {
    const functionName = this.getCallerFunctionName();
    const logMessage = `[${functionName}] ${message}`;
    console.log(logMessage);
  }

  static getLogsCount(): number {
    const logs = this.getLogsFromLocalStorage();
    return logs.length;
  }

  static getLogs(): string[] {
    return this.getLogsFromLocalStorage();
  }

  static exportLogs(fileDownloader?: { handleFileDownload?: (content: string) => void }): void {
    const logs = this.getLogsFromLocalStorage();
    if (fileDownloader?.handleFileDownload) {
      fileDownloader.handleFileDownload(logs.join("\n\n"));
    }
  }
}
