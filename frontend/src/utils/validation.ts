/**
 * 表单验证工具
 * Form validation utilities
 */

import { Rule } from 'antd/es/form';

/**
 * 验证规则类型
 * Validation rule types
 */
export type ValidationRule = Rule;

/**
 * 常用验证规则
 * Common validation rules
 */
export const commonRules = {
  /**
   * 必填验证
   * Required validation
   */
  required: (message = '此项为必填项'): ValidationRule => ({
    required: true,
    message,
  }),

  /**
   * 邮箱验证
   * Email validation
   */
  email: (message = '请输入有效的邮箱地址'): ValidationRule => ({
    type: 'email',
    message,
  }),

  /**
   * URL验证
   * URL validation
   */
  url: (message = '请输入有效的URL地址'): ValidationRule => ({
    type: 'url',
    message,
  }),

  /**
   * 手机号验证
   * Phone number validation
   */
  phone: (message = '请输入有效的手机号码'): ValidationRule => ({
    pattern: /^1[3-9]\d{9}$/,
    message,
  }),

  /**
   * 长度验证
   * Length validation
   */
  length: (min: number, max: number, message?: string): ValidationRule => ({
    min,
    max,
    message: message || `长度应在${min}到${max}个字符之间`,
  }),

  /**
   * 最小长度验证
   * Minimum length validation
   */
  minLength: (min: number, message?: string): ValidationRule => ({
    min,
    message: message || `至少需要${min}个字符`,
  }),

  /**
   * 最大长度验证
   * Maximum length validation
   */
  maxLength: (max: number, message?: string): ValidationRule => ({
    max,
    message: message || `最多${max}个字符`,
  }),

  /**
   * 数字范围验证
   * Number range validation
   */
  numberRange: (min: number, max: number, message?: string): ValidationRule => ({
    type: 'number',
    min,
    max,
    message: message || `数值应在${min}到${max}之间`,
  }),

  /**
   * 正则表达式验证
   * Regex pattern validation
   */
  pattern: (pattern: RegExp, message: string): ValidationRule => ({
    pattern,
    message,
  }),

  /**
   * 自定义验证
   * Custom validation
   */
  validator: (
    validator: (rule: unknown, value: unknown) => Promise<void> | void,
    message?: string
  ): ValidationRule => ({
    validator: async (rule, value) => {
      await validator(rule, value);
    },
    message,
  }),
};

/**
 * API路径验证
 * API path validation
 */
export const apiPathRule = (): ValidationRule => ({
  pattern: /^\/[a-zA-Z0-9/_-]*$/,
  message: 'API路径必须以/开头，只能包含字母、数字、/、_、-',
});

/**
 * HTTP方法验证
 * HTTP method validation
 */
export const httpMethodRule = (): ValidationRule => ({
  validator: async (_rule, value) => {
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    if (value && !validMethods.includes(value)) {
      throw new Error('请选择有效的HTTP方法');
    }
  },
});

/**
 * JSON格式验证
 * JSON format validation
 */
export const jsonRule = (message = '请输入有效的JSON格式'): ValidationRule => ({
  validator: async (_rule, value) => {
    if (!value) return;
    try {
      JSON.parse(value);
    } catch {
      throw new Error(message);
    }
  },
});

/**
 * 数据模型名称验证
 * Data model name validation
 */
export const modelNameRule = (): ValidationRule => ({
  pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
  message: '模型名称必须以字母开头，只能包含字母、数字和下划线',
});

/**
 * 字段名称验证
 * Field name validation
 */
export const fieldNameRule = (): ValidationRule => ({
  pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
  message: '字段名称必须以字母开头，只能包含字母、数字和下划线',
});

/**
 * 组合验证规则
 * Combine validation rules
 */
export function combineRules(...rules: ValidationRule[]): ValidationRule[] {
  return rules;
}

/**
 * 条件验证规则
 * Conditional validation rule
 */
export function conditionalRule(
  condition: () => boolean,
  rule: ValidationRule
): ValidationRule | undefined {
  return condition() ? rule : undefined;
}

