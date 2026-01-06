import { DataBinding } from '@/types/component';

/**
 * Resolve data binding value
 * 解析数据绑定值
 * @param binding - Data binding configuration
 * @returns {Promise<any>} Resolved data value
 */
export async function resolveDataBinding(binding: DataBinding): Promise<any> {
  try {
    switch (binding.sourceType) {
      case 'static':
        // 静态数据
        if (binding.defaultValue) {
          try {
            return typeof binding.defaultValue === 'string'
              ? JSON.parse(binding.defaultValue)
              : binding.defaultValue;
          } catch {
            return binding.defaultValue;
          }
        }
        return null;

      case 'api':
        // API接口数据
        if (binding.sourceId) {
          const response = await fetch(binding.sourceId, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          
          // 根据数据路径提取数据
          if (binding.dataPath) {
            return getNestedValue(data, binding.dataPath);
          }
          return data;
        }
        return null;

      case 'model':
        // 数据模型数据
        if (binding.sourceId) {
          // 从数据模型获取数据（实际应用中应从后端获取）
          const modelData = localStorage.getItem(`model_${binding.sourceId}`);
          if (modelData) {
            const data = JSON.parse(modelData);
            if (binding.dataPath) {
              return getNestedValue(data, binding.dataPath);
            }
            return data;
          }
        }
        return binding.defaultValue || null;

      default:
        return binding.defaultValue || null;
    }
  } catch (error) {
    console.error('Data binding error:', error);
    return binding.defaultValue || null;
  }
}

/**
 * Get nested value from object by path
 * 根据路径从对象中获取嵌套值
 * @param obj - Object to get value from
 * @param path - Path string like "data.list"
 * @returns {any} Nested value
 */
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value;
}

/**
 * Apply data binding to component props
 * 将数据绑定应用到组件属性
 * @param binding - Data binding configuration
 * @param componentType - Component type
 * @param currentProps - Current component props
 * @returns {Promise<any>} Updated props with bound data
 */
export async function applyDataBinding(
  binding: DataBinding,
  componentType: string,
  currentProps: any = {}
): Promise<any> {
  const data = await resolveDataBinding(binding);

  switch (componentType) {
    case 'table':
      return {
        ...currentProps,
        dataSource: Array.isArray(data) ? data : data?.dataSource || [],
        columns: currentProps.columns || [],
      };

    case 'select':
    case 'radio':
      return {
        ...currentProps,
        options: Array.isArray(data) ? data : data?.options || [],
      };

    case 'input':
    case 'text':
      return {
        ...currentProps,
        value: data || currentProps.value || '',
      };

    case 'image':
      return {
        ...currentProps,
        src: data || currentProps.src || '',
      };

    default:
      return {
        ...currentProps,
        ...data,
      };
  }
}

