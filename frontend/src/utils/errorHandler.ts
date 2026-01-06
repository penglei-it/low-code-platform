/**
 * 统一错误处理工具
 * Unified error handling utility
 */

import { message, Modal } from 'antd';
import { logger } from './logger';

/**
 * 错误类型
 * Error types
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 应用错误类
 * Application error class
 */
export class AppError extends Error {
  type: ErrorType;
  code?: string;
  statusCode?: number;
  details?: unknown;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    code?: string,
    statusCode?: number,
    details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 错误消息映射
 * Error message mapping
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: '网络连接失败，请检查网络设置',
  [ErrorType.VALIDATION]: '输入数据验证失败，请检查输入内容',
  [ErrorType.PERMISSION]: '权限不足，无法执行此操作',
  [ErrorType.NOT_FOUND]: '请求的资源不存在',
  [ErrorType.SERVER]: '服务器错误，请稍后重试',
  [ErrorType.UNKNOWN]: '发生未知错误，请稍后重试',
};

/**
 * 处理错误
 * Handle error
 * @param error - 错误对象
 * @param options - 处理选项
 */
export function handleError(
  error: unknown,
  options: {
    showMessage?: boolean;
    showModal?: boolean;
    logError?: boolean;
    customMessage?: string;
  } = {}
): void {
  const {
    showMessage = true,
    showModal = false,
    logError = true,
    customMessage,
  } = options;

  // 解析错误
  const appError = parseError(error);

  // 记录错误日志
  if (logError) {
    logger.error('错误处理', appError, {
      type: appError.type,
      code: appError.code,
      statusCode: appError.statusCode,
      details: appError.details,
    });
  }

  // 显示错误消息
  const errorMessage = customMessage || ERROR_MESSAGES[appError.type] || appError.message;

  if (showModal) {
    Modal.error({
      title: '错误',
      content: errorMessage,
      okText: '确定',
    });
  } else if (showMessage) {
    message.error(errorMessage);
  }
}

/**
 * 解析错误
 * Parse error
 * @param error - 错误对象
 * @returns 应用错误对象
 */
export function parseError(error: unknown): AppError {
  // 如果是AppError，直接返回
  if (error instanceof AppError) {
    return error;
  }

  // 如果是Axios错误
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as {
      isAxiosError: boolean;
      response?: {
        status: number;
        data?: {
          error?: string;
          message?: string;
        };
      };
      message?: string;
    };

    if (axiosError.response) {
      const statusCode = axiosError.response.status;
      const errorMessage =
        axiosError.response.data?.error ||
        axiosError.response.data?.message ||
        axiosError.message ||
        '请求失败';

      let errorType: ErrorType;
      if (statusCode >= 400 && statusCode < 500) {
        if (statusCode === 401 || statusCode === 403) {
          errorType = ErrorType.PERMISSION;
        } else if (statusCode === 404) {
          errorType = ErrorType.NOT_FOUND;
        } else if (statusCode === 422) {
          errorType = ErrorType.VALIDATION;
        } else {
          errorType = ErrorType.VALIDATION;
        }
      } else if (statusCode >= 500) {
        errorType = ErrorType.SERVER;
      } else {
        errorType = ErrorType.UNKNOWN;
      }

      return new AppError(errorMessage, errorType, undefined, statusCode, axiosError.response.data);
    } else {
      // 网络错误
      return new AppError(
        axiosError.message || '网络连接失败',
        ErrorType.NETWORK,
        'NETWORK_ERROR'
      );
    }
  }

  // 如果是Error对象
  if (error instanceof Error) {
    return new AppError(error.message, ErrorType.UNKNOWN);
  }

  // 如果是字符串
  if (typeof error === 'string') {
    return new AppError(error, ErrorType.UNKNOWN);
  }

  // 未知错误
  return new AppError('发生未知错误', ErrorType.UNKNOWN);
}

/**
 * 创建错误处理函数
 * Create error handler function
 * @param options - 处理选项
 * @returns 错误处理函数
 */
export function createErrorHandler(options: {
  showMessage?: boolean;
  showModal?: boolean;
  logError?: boolean;
  customMessage?: string;
} = {}) {
  return (error: unknown) => handleError(error, options);
}

