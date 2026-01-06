/**
 * 安全代码执行器
 * Safe code executor to replace eval() with a more secure approach
 */

import { logger } from './logger';

/**
 * 允许的安全函数白名单
 * Whitelist of allowed safe functions
 */
const SAFE_FUNCTIONS: Record<string, unknown> = {
  // 数学函数
  Math: Math,
  parseInt: parseInt,
  parseFloat: parseFloat,
  Number: Number,
  String: String,
  Boolean: Boolean,
  // 数组函数
  Array: Array,
  // 日期函数
  Date: Date,
  // JSON函数
  JSON: JSON,
};

/**
 * 执行安全的表达式
 * Execute safe expression
 * @param expression - 要执行的表达式
 * @param context - 执行上下文（可用的变量和函数）
 * @returns 执行结果
 */
export function executeSafeExpression(
  expression: string,
  context: Record<string, unknown> = {}
): unknown {
  try {
    // 验证表达式不包含危险操作
    if (!isExpressionSafe(expression)) {
      throw new Error('表达式包含不安全的操作');
    }

    // 创建安全的执行上下文
    const safeContext = {
      ...SAFE_FUNCTIONS,
      ...context,
    };

    // 使用Function构造函数创建函数（比eval更安全）
    // 注意：这仍然不是完全安全的，但在受控环境中可以使用
    const func = new Function(
      ...Object.keys(safeContext),
      `"use strict"; return (${expression});`
    );

    return func(...Object.values(safeContext));
  } catch (error) {
    logger.error('安全表达式执行失败', error, { expression });
    throw error;
  }
}

/**
 * 检查表达式是否安全
 * Check if expression is safe
 * @param expression - 要检查的表达式
 * @returns 是否安全
 */
function isExpressionSafe(expression: string): boolean {
  // 禁止的操作列表
  const dangerousPatterns = [
    /eval\s*\(/i, // eval调用
    /Function\s*\(/i, // Function构造函数（除了我们自己的）
    /setTimeout\s*\(/i, // setTimeout
    /setInterval\s*\(/i, // setInterval
    /import\s*\(/i, // 动态import
    /require\s*\(/i, // require
    /process\./i, // process对象
    /global\./i, // global对象
    /window\./i, // window对象（如果需要可以允许）
    /document\./i, // document对象
    /localStorage/i, // localStorage
    /sessionStorage/i, // sessionStorage
    /XMLHttpRequest/i, // XMLHttpRequest
    /fetch\s*\(/i, // fetch
    /\.__proto__/i, // 原型链操作
    /\.constructor/i, // constructor访问
  ];

  // 检查是否包含危险模式
  for (const pattern of dangerousPatterns) {
    if (pattern.test(expression)) {
      logger.warn('检测到不安全的表达式', { expression, pattern: pattern.toString() });
      return false;
    }
  }

  return true;
}

/**
 * 执行自定义代码（受限环境）
 * Execute custom code in restricted environment
 * @param code - 要执行的代码
 * @param context - 执行上下文
 * @returns 执行结果
 */
export function executeCustomCode(
  code: string,
  context: Record<string, unknown> = {}
): unknown {
  try {
    // 验证代码安全性
    if (!isCodeSafe(code)) {
      throw new Error('代码包含不安全的操作');
    }

    // 创建受限的执行环境
    const restrictedContext = {
      ...SAFE_FUNCTIONS,
      ...context,
      // 提供一些常用的工具函数
      console: {
        log: logger.info.bind(logger),
        warn: logger.warn.bind(logger),
        error: logger.error.bind(logger),
      },
    };

    // 使用Function构造函数执行代码
    const func = new Function(
      ...Object.keys(restrictedContext),
      `"use strict"; ${code}`
    );

    return func(...Object.values(restrictedContext));
  } catch (error) {
    logger.error('自定义代码执行失败', error, { code });
    throw error;
  }
}

/**
 * 检查代码是否安全
 * Check if code is safe
 * @param code - 要检查的代码
 * @returns 是否安全
 */
function isCodeSafe(code: string): boolean {
  // 使用与表达式相同的安全检查
  return isExpressionSafe(code);
}

