import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { logger } from '@/utils/logger';
import { parseError } from '@/utils/errorHandler';

/**
 * API client configuration
 * API客户端配置
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * 请求拦截器
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 可以在这里添加认证token等
    // Can add authentication token here, etc.
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    logger.debug('API请求', { url: config.url, method: config.method });
    return config;
  },
  (error: AxiosError) => {
    logger.error('API请求失败', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * 响应拦截器
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.debug('API响应成功', { url: response.config.url, status: response.status });
    // 后端返回格式：{ success: true, data: ... }
    // 如果后端返回了data字段，直接返回data；否则返回整个response.data
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data;
    }
    return response.data;
  },
  (error: AxiosError) => {
    // 使用统一的错误处理
    const appError = parseError(error);
    logger.error('API响应错误', appError, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
    });
    return Promise.reject(appError);
  }
);

/**
 * 项目数据接口
 * Project data interface
 */
export interface ProjectData {
  name: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * 项目接口
 * Project interface
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/**
 * Project API
 * 项目API
 */
export const projectAPI = {
  // 获取所有项目
  getAll: (): Promise<Project[]> => apiClient.get('/projects'),
  // 获取单个项目
  getById: (id: string): Promise<Project> => apiClient.get(`/projects/${id}`),
  // 创建项目
  create: (data: ProjectData): Promise<Project> => apiClient.post('/projects', data),
  // 更新项目
  update: (id: string, data: Partial<ProjectData>): Promise<Project> =>
    apiClient.put(`/projects/${id}`, data),
  // 删除项目
  delete: (id: string): Promise<void> => apiClient.delete(`/projects/${id}`),
  // 保存项目组件
  saveComponents: (id: string, components: unknown[]): Promise<void> =>
    apiClient.post(`/projects/${id}/components`, { components }),
};

/**
 * Component API
 * 组件API
 */
export const componentAPI = {
  // 获取所有组件
  getAll: () => apiClient.get('/components'),
  // 获取单个组件信息
  getByType: (type: string) => apiClient.get(`/components/${type}`),
};

/**
 * AI代码生成上下文
 * AI code generation context
 */
export interface AICodeContext {
  components?: unknown[];
  requirements?: string;
  [key: string]: unknown;
}

/**
 * AI代码生成响应
 * AI code generation response
 */
export interface AICodeResponse {
  code: string;
  explanation?: string;
  recommendations?: Array<{ type: string; reason: string }>;
}

/**
 * AI API
 * AI功能API
 */
export const aiAPI = {
  // 生成代码
  generateCode: (description: string, context?: AICodeContext): Promise<AICodeResponse> =>
    apiClient.post('/ai/generate-code', { description, context }),
  // 推荐组件
  recommendComponents: (
    context: string,
    existingComponents?: string[]
  ): Promise<{ recommendations: Array<{ type: string; reason: string }> }> =>
    apiClient.post('/ai/recommend-components', { context, existingComponents }),
  // 优化代码
  optimizeCode: (code: string, optimizationType?: string): Promise<{ optimizedCode: string }> =>
    apiClient.post('/ai/optimize-code', { code, optimizationType }),
  // 生成测试用例
  generateTests: (code: string, componentType?: string): Promise<{ tests: string }> =>
    apiClient.post('/ai/generate-tests', { code, componentType }),
  // 分析代码质量
  analyzeCode: (code: string): Promise<{ analysis: string }> =>
    apiClient.post('/ai/analyze-code', { code }),
};

/**
 * Data Model API
 * 数据模型API
 */
import { DataModel } from '@/types/api';

export const dataModelAPI = {
  // 获取所有数据模型
  getAll: (): Promise<DataModel[]> => apiClient.get('/data-models'),
  // 获取单个数据模型
  getById: (id: string): Promise<DataModel> => apiClient.get(`/data-models/${id}`),
  // 创建数据模型
  create: (data: Partial<DataModel>): Promise<DataModel> => apiClient.post('/data-models', data),
  // 更新数据模型
  update: (id: string, data: Partial<DataModel>): Promise<DataModel> =>
    apiClient.put(`/data-models/${id}`, data),
  // 删除数据模型
  delete: (id: string): Promise<void> => apiClient.delete(`/data-models/${id}`),
};

/**
 * 工作流数据接口
 * Workflow data interface
 */
export interface WorkflowData {
  name: string;
  description?: string;
  nodes?: unknown[];
  edges?: unknown[];
  [key: string]: unknown;
}

/**
 * Workflow API
 * 工作流API
 */
export const workflowAPI = {
  // 获取所有工作流
  getAll: (): Promise<unknown[]> => apiClient.get('/workflows'),
  // 获取单个工作流
  getById: (id: string): Promise<unknown> => apiClient.get(`/workflows/${id}`),
  // 创建工作流
  create: (data: WorkflowData): Promise<unknown> => apiClient.post('/workflows', data),
  // 更新工作流
  update: (id: string, data: Partial<WorkflowData>): Promise<unknown> =>
    apiClient.put(`/workflows/${id}`, data),
  // 删除工作流
  delete: (id: string): Promise<void> => apiClient.delete(`/workflows/${id}`),
};

/**
 * API定义数据接口
 * API Definition data interface
 */
export interface ApiDefinitionData {
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  description?: string;
  queryParams?: unknown[];
  headers?: unknown[];
  bodySample?: unknown;
  mockResponse?: unknown;
}

/**
 * API定义接口
 * API Definition interface
 */
export interface ApiDefinition {
  id: string;
  name: string;
  path: string;
  method: string;
  description?: string;
  queryParams?: unknown[];
  headers?: unknown[];
  bodySample?: unknown;
  mockResponse?: unknown;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * API Definition API
 * API定义API
 */
export const apiDefinitionAPI = {
  // 获取所有API定义
  getAll: (): Promise<ApiDefinition[]> => apiClient.get('/api-definitions'),
  // 获取单个API定义
  getById: (id: string): Promise<ApiDefinition> => apiClient.get(`/api-definitions/${id}`),
  // 创建API定义
  create: (data: ApiDefinitionData): Promise<ApiDefinition> =>
    apiClient.post('/api-definitions', data),
  // 更新API定义
  update: (id: string, data: Partial<ApiDefinitionData>): Promise<ApiDefinition> =>
    apiClient.put(`/api-definitions/${id}`, data),
  // 删除API定义
  delete: (id: string): Promise<void> => apiClient.delete(`/api-definitions/${id}`),
};

/**
 * 表单定义数据接口
 * Form Definition data interface
 */
export interface FormDefinitionData {
  name: string;
  description?: string;
  config?: unknown;
  fields: unknown[];
}

/**
 * 表单定义接口
 * Form Definition interface
 */
export interface FormDefinition {
  id: string;
  name: string;
  description?: string;
  config?: unknown;
  fields: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Form Definition API
 * 表单定义API
 */
export const formDefinitionAPI = {
  // 获取所有表单定义
  getAll: (): Promise<FormDefinition[]> => apiClient.get('/form-definitions'),
  // 获取单个表单定义
  getById: (id: string): Promise<FormDefinition> => apiClient.get(`/form-definitions/${id}`),
  // 创建表单定义
  create: (data: FormDefinitionData): Promise<FormDefinition> =>
    apiClient.post('/form-definitions', data),
  // 更新表单定义
  update: (id: string, data: Partial<FormDefinitionData>): Promise<FormDefinition> =>
    apiClient.put(`/form-definitions/${id}`, data),
  // 删除表单定义
  delete: (id: string): Promise<void> => apiClient.delete(`/form-definitions/${id}`),
  // 提交表单数据
  submit: (id: string, data: unknown): Promise<unknown> =>
    apiClient.post(`/form-definitions/${id}/submit`, { data }),
  // 获取表单提交数据
  getSubmissions: (id: string): Promise<unknown[]> =>
    apiClient.get(`/form-definitions/${id}/submissions`),
};

export default apiClient;

