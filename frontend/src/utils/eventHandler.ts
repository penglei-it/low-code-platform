import { message } from 'antd';
import { EventHandler } from '@/types/component';
import { logger } from './logger';
import { handleError } from './errorHandler';
import { executeSafeExpression, executeCustomCode } from './safeCodeExecutor';

/**
 * Execute event handler
 * 执行事件处理器
 * @param handler - Event handler configuration
 * @param event - Original event object
 * @param context - Additional context (component data, etc.)
 */
export function executeEventHandler(
  handler: EventHandler,
  event?: unknown,
  context?: Record<string, unknown>
): void {
  try {
    switch (handler.action) {
      case 'showMessage':
        const msg = handler.params?.message || '操作成功';
        message.success(msg);
        break;

      case 'navigate':
        const path = handler.params?.path || '/';
        // 实际应用中应使用路由导航
        window.location.href = path;
        break;

      case 'callAPI': {
        const url = handler.params?.url;
        const method = handler.params?.method || 'GET';
        if (!url) break;

        // 尝试优先使用 API 设计器的 Mock 响应
        const saved = localStorage.getItem('api_designer_defs');
        if (saved) {
          try {
            const apis = JSON.parse(saved) as Array<{ path: string; mockResponse?: string }>;
            const target = apis.find((api) => api.path === url);
            if (target?.mockResponse) {
              const mockData = JSON.parse(target.mockResponse);
              message.success('API调用成功（Mock）');
              logger.debug('API Mock Response', { url, mockData });
              break;
            }
          } catch (error) {
            logger.warn('解析API Mock响应失败', error);
          }
        }

        fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(async (res) => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then((data) => {
            message.success('API调用成功');
            logger.info('API调用成功', { url, method, data });
          })
          .catch((error) => {
            handleError(error, {
              customMessage: 'API调用失败，请检查网络连接或API地址',
            });
          });
        break;
      }

      case 'setState':
        // 实际应用中应更新组件状态
        logger.debug('Set state', { params: handler.params });
        break;

      case 'custom':
        if (handler.code) {
          // 使用安全的代码执行器替代eval
          try {
            executeCustomCode(handler.code, {
              event,
              context,
              params: handler.params,
            });
            logger.debug('自定义代码执行成功', { code: handler.code });
          } catch (error) {
            handleError(error, {
              customMessage: '自定义代码执行失败，请检查代码语法',
            });
          }
        }
        break;

      default:
        logger.warn('未知的事件动作', { action: handler.action });
    }
  } catch (error) {
    handleError(error, {
      customMessage: '事件处理失败',
    });
  }
}

