/**
 * API类型定义
 * API type definitions
 */

/**
 * API参数类型
 * API parameter types
 */
export type ApiParamType = 'string' | 'number' | 'boolean' | 'object' | 'array';

/**
 * API参数定义
 * API parameter definition
 */
export interface ApiParam {
  name: string;
  type: ApiParamType;
  required: boolean;
  description?: string;
  defaultValue?: string | number | boolean;
}

/**
 * HTTP方法类型
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * 环境配置
 * Environment configuration
 */
export interface ApiEnvironment {
  id: string;
  name: string; // 环境名称，如：开发、测试、生产
  baseUrl: string; // 基础URL
  description?: string;
  variables?: Record<string, string>; // 环境变量
}

/**
 * API定义
 * API definition
 */
export interface ApiDefinition {
  id: string;
  name: string;
  path: string; // 相对路径，如 /api/users
  method: HttpMethod;
  description?: string;
  queryParams?: ApiParam[];
  headers?: ApiParam[];
  bodySample?: string;
  mockResponse?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 错误类型
 * Error types
 */
export type ApiErrorType = 'cors' | 'network' | 'timeout' | 'server' | 'client' | 'unknown';

/**
 * API测试结果
 * API test result
 */
export interface ApiTestResult {
  status: 'success' | 'error';
  statusCode?: number;
  responseTime?: number;
  output: unknown;
  error?: string;
  // 新增字段
  responseHeaders?: Record<string, string>;
  requestHeaders?: Record<string, string>;
  requestUrl?: string;
  requestMethod?: string;
  requestBody?: string;
  responseSize?: number; // 响应大小（字节）
  contentType?: string;
  isMock?: boolean; // 是否为Mock响应
  // 错误详情
  errorType?: ApiErrorType; // 错误类型
  errorDetails?: string; // 详细错误信息
  errorSuggestions?: string[]; // 解决建议
}

/**
 * 数据模型字段类型
 * Data model field types
 */
export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';

/**
 * 数据模型字段定义
 * Data model field definition
 */
export interface DataModelField {
  name: string;
  type: FieldType;
  required?: boolean;
  description?: string;
  defaultValue?: unknown;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

/**
 * 数据模型定义
 * Data model definition
 */
export interface DataModel {
  id: string;
  name: string;
  description?: string;
  fields: DataModelField[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 通用API响应
 * Generic API response
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 分页响应
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

