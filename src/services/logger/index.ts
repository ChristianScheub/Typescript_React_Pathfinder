import { LoggerImpl } from '@services/logger/logic/LoggerImpl';
import { LoggerMethods } from '@services/logger/logic/LoggerMethods';
import type { ILoggerService } from '@services/logger/ILoggerService';

const logger: ILoggerService = {
  log: (message: string) => LoggerImpl.log(message),
  info: (message: string) => LoggerMethods.info(message),
  infoService: (message: string) => LoggerMethods.infoService(message),
  infoRedux: (message: string) => LoggerMethods.infoRedux(message),
  infoAPI: (message: string, requestData?: unknown, responseData?: unknown) => 
    LoggerMethods.infoAPI(message, requestData, responseData),
  warn: (message: string) => LoggerMethods.warn(message),
  warnService: (message: string) => LoggerMethods.warnService(message),
  error: (message: string) => LoggerMethods.error(message),
  errorService: (message: string) => LoggerMethods.errorService(message),
  errorStack: (message: string, error: Error) => LoggerMethods.errorStack(message, error),
  cache: (message: string) => LoggerMethods.cache(message),
  subscribe: (callback) => LoggerImpl.subscribe(callback),
  deleteLogs: () => LoggerImpl.deleteLogs(),
  getLogsCount: () => LoggerImpl.getLogsCount(),
  getLogs: () => LoggerImpl.getLogs(),
  exportLogs: () => LoggerImpl.exportLogs(),
};

// Export as default for backwards compatibility
const Logger = logger;
export default Logger;
export { logger, Logger };
export type { ILoggerService };
