export interface ILoggerService {
  log(message: string): void;
  info(message: string): void;
  infoService(message: string): void;
  infoRedux(message: string): void;
  infoAPI(message: string, requestData?: unknown, responseData?: unknown): void;
  warn(message: string): void;
  warnService(message: string): void;
  error(message: string): void;
  errorService(message: string): void;
  errorStack(message: string, error: Error): void;
  cache(message: string): void;
  subscribe(callback: (message: string, type: 'info' | 'warning' | 'error' | 'cache') => void): () => void;
  deleteLogs(): void;
  getLogsCount(): number;
  getLogs(): string[];
  exportLogs(): void;
}
