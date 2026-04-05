import {
  featureFlag_Debug_AllLogs,
  featureFlag_Debug_Log_Cache,
  featureFlag_Debug_Log_Error,
  featureFlag_Debug_Log_Info,
  featureFlag_Debug_Log_Service,
  featureFlag_Debug_Log_Warning,
  featureFlag_Debug_Log_infoRedux,
  featureFlag_Debug_Log_API
} from '@config/featureFlags';
import { LoggerImpl } from '@services/logger/logic/LoggerImpl';

export class LoggerMethods {
  static info(message: string): void {
    if (featureFlag_Debug_Log_Info || featureFlag_Debug_AllLogs) {
      LoggerImpl.log(LoggerImpl['formatMessage']?.call(LoggerImpl, `INFO: ${message}`, "ℹ️") || `INFO: ${message}`);
    }
  }

  static infoService(message: string): void {
    if (featureFlag_Debug_Log_Service || featureFlag_Debug_AllLogs) {
      const formattedMsg = `⚙️ Service Call Info: ${message}`;
      LoggerImpl.log(formattedMsg);
      LoggerImpl['notifyListeners']?.call(LoggerImpl, formattedMsg, 'info');
    }
  }

  static infoRedux(message: string): void {
    if (featureFlag_Debug_Log_infoRedux || featureFlag_Debug_AllLogs) {
      LoggerImpl.log(`👁️‍🗨️ Redux Log: ${message}`);
    }
  }

  static infoAPI(message: string, requestData?: unknown, responseData?: unknown): void {
    if (featureFlag_Debug_Log_API || featureFlag_Debug_AllLogs) {
      let logMessage = `API: ${message}`;
      if (requestData) {
        logMessage += `\nRequest: ${JSON.stringify(requestData, null, 2)}`;
      }
      if (responseData) {
        logMessage += `\nResponse: ${JSON.stringify(responseData, null, 2)}`;
      }
      LoggerImpl.log(`🌐 ${logMessage}`);
    }
  }

  static warn(message: string): void {
    if (featureFlag_Debug_Log_Warning || featureFlag_Debug_AllLogs) {
      LoggerImpl.log(`⚠️ WARN: ${message}`);
    }
  }

  static warnService(message: string): void {
    if (featureFlag_Debug_Log_Warning || featureFlag_Debug_Log_Service || featureFlag_Debug_AllLogs) {
      const formattedMsg = `⚙️⚠️ Service Warning: ${message}`;
      LoggerImpl.log(formattedMsg);
      LoggerImpl['notifyListeners']?.call(LoggerImpl, formattedMsg, 'warning');
    }
  }

  static error(message: string): void {
    if (featureFlag_Debug_Log_Error || featureFlag_Debug_AllLogs) {
      LoggerImpl.log(`‼️🆘 ERROR: ${message}`);
    }
  }

  static errorService(message: string): void {
    if (featureFlag_Debug_Log_Service || featureFlag_Debug_AllLogs) {
      const formattedMsg = `⚙️‼️ Service Error: ${message}`;
      LoggerImpl.log(formattedMsg);
      LoggerImpl['notifyListeners']?.call(LoggerImpl, formattedMsg, 'error');
    }
  }

  static errorStack(message: string, error: Error): void {
    if (featureFlag_Debug_Log_Error || featureFlag_Debug_AllLogs) {
      const errorMessage = `‼️🆘 ERROR: ${message}\nError Details: ${error.message}\nStack Trace: ${error.stack}`;
      LoggerImpl.log(errorMessage);
      LoggerImpl['notifyListeners']?.call(LoggerImpl, errorMessage, 'error');
    }
  }

  static cache(message: string): void {
    if (featureFlag_Debug_Log_Cache || featureFlag_Debug_AllLogs) {
      const formattedMsg = `🗄️ CACHE: ${message}`;
      LoggerImpl.log(formattedMsg);
      LoggerImpl['notifyListeners']?.call(LoggerImpl, formattedMsg, 'cache');
    }
  }
}
