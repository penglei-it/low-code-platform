/**
 * 日志工具
 * Logger utility for consistent logging across the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * 日志配置
 * Logger configuration
 */
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
}

/**
 * 日志级别优先级
 * Log level priority
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * 默认配置
 * Default configuration
 */
const defaultConfig: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  enableConsole: true,
  enableRemote: false,
};

/**
 * 日志类
 * Logger class
 */
class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * 检查是否应该记录日志
   * Check if log should be recorded
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  /**
   * 格式化日志消息
   * Format log message
   */
  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return `${prefix} ${message}`;
  }

  /**
   * 记录调试日志
   * Log debug message
   */
  debug(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('debug')) return;
    if (this.config.enableConsole) {
      console.debug(this.formatMessage('debug', message), ...args);
    }
  }

  /**
   * 记录信息日志
   * Log info message
   */
  info(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('info')) return;
    if (this.config.enableConsole) {
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  /**
   * 记录警告日志
   * Log warning message
   */
  warn(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('warn')) return;
    if (this.config.enableConsole) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  /**
   * 记录错误日志
   * Log error message
   */
  error(message: string, error?: Error | unknown, ...args: unknown[]): void {
    if (!this.shouldLog('error')) return;
    if (this.config.enableConsole) {
      console.error(this.formatMessage('error', message), error, ...args);
    }
    // 在生产环境中可以发送到远程日志服务
    if (this.config.enableRemote && process.env.NODE_ENV === 'production') {
      // TODO: 实现远程日志上报
      this.sendToRemote('error', message, error);
    }
  }

  /**
   * 发送日志到远程服务
   * Send log to remote service
   */
  private sendToRemote(level: LogLevel, message: string, error?: unknown): void {
    // 只在生产环境且启用远程日志时发送
    if (!this.config.enableRemote || process.env.NODE_ENV !== 'production') {
      return;
    }

    try {
      // 构建日志数据
      const logData = {
        level,
        message,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        error: error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
      };

      // 发送到远程日志服务（使用navigator.sendBeacon确保在页面卸载时也能发送）
      const logEndpoint = process.env.VITE_LOG_ENDPOINT || '/api/logs';
      const blob = new Blob([JSON.stringify(logData)], { type: 'application/json' });
      
      // 优先使用sendBeacon（异步，不阻塞页面卸载）
      if (navigator.sendBeacon) {
        navigator.sendBeacon(logEndpoint, blob);
      } else {
        // 降级方案：使用fetch
        fetch(logEndpoint, {
          method: 'POST',
          body: blob,
          keepalive: true, // 允许在页面卸载后继续发送
        }).catch(() => {
          // 静默失败，不影响用户体验
        });
      }
    } catch (err) {
      // 远程日志上报失败不应影响应用运行
      // 只在开发环境输出错误
      // Check if we're in development mode
      // 检查是否在开发模式
      // Check if we're in development mode (browser environment)
      // 检查是否在开发模式（浏览器环境）
      // Note: In browser, process.env.NODE_ENV is typically undefined
      // 注意：在浏览器中，process.env.NODE_ENV 通常是 undefined
      const nodeEnv = typeof process !== 'undefined' && process.env ? String(process.env.NODE_ENV) : 'production';
      if (nodeEnv !== 'production') {
        console.warn('远程日志上报失败', err);
      }
    }
  }
}

/**
 * 导出单例日志实例
 * Export singleton logger instance
 */
export const logger = new Logger();

/**
 * 创建自定义日志实例
 * Create custom logger instance
 */
export function createLogger(config: Partial<LoggerConfig>): Logger {
  return new Logger(config);
}

