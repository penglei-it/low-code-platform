/**
 * Mock data generator for preview
 * 预览数据模拟生成器
 */

import { ComponentNode, ComponentProps as ComponentPropsType } from '@/types/component';

/**
 * 表格列定义
 * Table column definition
 */
interface TableColumn {
  dataIndex?: string;
  title?: string;
  key?: string;
  [key: string]: unknown;
}

/**
 * 表格行数据
 * Table row data
 */
interface TableRowData {
  key: number | string;
  [key: string]: unknown;
}

/**
 * Generate mock data for table component
 * 为表格组件生成模拟数据
 * @param columns - Table columns
 * @param count - Number of rows
 * @returns {TableRowData[]} Mock data array
 */
export function generateTableMockData(columns: TableColumn[] = [], count: number = 5): TableRowData[] {
  const data: TableRowData[] = [];
  for (let i = 0; i < count; i++) {
    const row: TableRowData = { key: i };
    columns.forEach((col, index) => {
      if (col.dataIndex) {
        row[col.dataIndex] = `数据${i + 1}-${index + 1}`;
      } else {
        row[`col${index}`] = `数据${i + 1}-${index + 1}`;
      }
    });
    data.push(row);
  }
  return data;
}

/**
 * Generate mock data for select options
 * 为选择器生成模拟选项
 * @param count - Number of options
 * @returns {Array<{label: string, value: string}>} Options array
 */
export function generateSelectOptions(count: number = 3): Array<{ label: string; value: string }> {
  const options: Array<{ label: string; value: string }> = [];
  for (let i = 1; i <= count; i++) {
    options.push({
      label: `选项${i}`,
      value: `${i}`,
    });
  }
  return options;
}

/**
 * 组件属性类型
 * Component props type
 */
type ComponentProps = Record<string, unknown>;

/**
 * Mock数据返回类型
 * Mock data return type
 */
type MockData = Record<string, unknown>;

/**
 * Generate mock data based on component type
 * 根据组件类型生成模拟数据
 * @param componentType - Component type
 * @param props - Component props
 * @returns {MockData} Mock data
 */
export function generateMockData(componentType: string, props: ComponentProps = {}): MockData {
  switch (componentType) {
    case 'table':
      return {
        dataSource: generateTableMockData(Array.isArray(props.columns) ? props.columns : [], 5),
        columns:
          props.columns ||
          [
            { title: '列1', dataIndex: 'col1', key: 'col1' },
            { title: '列2', dataIndex: 'col2', key: 'col2' },
            { title: '列3', dataIndex: 'col3', key: 'col3' },
          ],
      };

    case 'select':
      return {
        options: props.options || generateSelectOptions(3),
      };

    case 'radio':
      return {
        options: props.options || generateSelectOptions(3),
      };

    case 'input':
      return {
        placeholder: props.placeholder || '请输入',
        value: props.value || '',
      };

    case 'text':
      return {
        content: props.content || '这是一段示例文本',
      };

    case 'image':
      return {
        src: props.src || 'https://via.placeholder.com/300x200',
        alt: props.alt || '示例图片',
      };

    case 'button':
      return {
        text: props.text || '按钮',
      };

    case 'pagination':
      return {
        current: props.current || 1,
        total: props.total || 50,
        pageSize: props.pageSize || 10,
      };

    case 'menu':
      return {
        items:
          props.items ||
          [
            { key: '1', label: '菜单项1' },
            { key: '2', label: '菜单项2' },
            { key: '3', label: '菜单项3' },
          ],
      };

    case 'breadcrumb':
      return {
        items:
          props.items ||
          [
            { title: '首页' },
            { title: '应用' },
            { title: '列表' },
          ],
      };

    default:
      return {};
  }
}

/**
 * Apply mock data to component tree
 * 为组件树应用模拟数据
 * @param components - Component tree
 * @returns {ComponentNode[]} Components with mock data
 */
export function applyMockDataToComponents(components: ComponentNode[]): ComponentNode[] {
  return components.map((component): ComponentNode => {
    const mockData = generateMockData(component.type, component.props);
    const updatedComponent: ComponentNode = {
      ...component,
      props: {
        ...(component.props || {}),
        ...mockData,
      } as ComponentPropsType,
    };

    if (component.children && component.children.length > 0) {
      updatedComponent.children = applyMockDataToComponents(component.children);
    }

    return updatedComponent;
  });
}

/**
 * 组件覆盖类型
 * Component override type
 */
interface ComponentOverride {
  props?: ComponentProps;
  [key: string]: unknown;
}

/**
 * Apply custom mock data overrides
 * 应用自定义模拟数据覆盖
 * @param components - Component tree
 * @param overrides - Override map keyed by component id
 * @returns {ComponentNode[]} Components with overrides applied
 */
export function applyCustomMockData(
  components: ComponentNode[],
  overrides: Record<string, ComponentOverride>
): ComponentNode[] {
  return components.map((component) => {
    const override = overrides?.[component.id] || {};
    const mergedProps = {
      ...component.props,
      ...(override.props || {}),
    };

    const updated: ComponentNode = {
      ...component,
      props: mergedProps as ComponentPropsType,
    };

    if (component.children && component.children.length > 0) {
      updated.children = applyCustomMockData(component.children, overrides);
    }

    return updated;
  });
}

/**
 * API定义类型
 * API definition type
 */
interface ApiDefinition {
  path: string;
  mockResponse?: string;
  [key: string]: unknown;
}

/**
 * Apply API mock data based on saved API designer definitions
 * 根据 API 设计器的 Mock 配置为组件提供数据
 * @param components - Component tree
 * @returns {ComponentNode[]} Components with API mock data applied
 */
export function applyApiMockData(components: ComponentNode[]): ComponentNode[] {
  let apiDefs: ApiDefinition[] = [];
  try {
    const saved = localStorage.getItem('api_designer_defs');
    apiDefs = saved ? (JSON.parse(saved) as ApiDefinition[]) : [];
  } catch {
    apiDefs = [];
  }

  const getMockByUrl = (url?: string): unknown => {
    if (!url) return null;
    const found = apiDefs.find((api) => api.path === url);
    if (found && found.mockResponse) {
      try {
        return JSON.parse(found.mockResponse);
      } catch {
        return found.mockResponse;
      }
    }
    return null;
  };

  const mapComponents = (list: ComponentNode[]): ComponentNode[] =>
    list.map((component) => {
      let next = component;
      if (component.dataBinding?.sourceType === 'api') {
        const mock = getMockByUrl(component.dataBinding.sourceId || component.dataBinding.dataPath);
        if (mock) {
          next = {
            ...component,
            props: {
              ...component.props,
              ...(component.type === 'table'
                ? { dataSource: Array.isArray(mock) ? mock : (mock && typeof mock === 'object' && ('data' in mock || 'list' in mock) ? ((mock as any).data || (mock as any).list || []) : []) }
                : component.type === 'select' || component.type === 'radio'
                ? { options: Array.isArray(mock) ? mock : (mock && typeof mock === 'object' && 'options' in mock ? (mock as any).options || [] : []) }
                : { value: (mock && typeof mock === 'object' && 'value' in mock ? (mock as any).value : mock), content: (mock && typeof mock === 'object' && 'content' in mock ? (mock as any).content : mock) }),
            },
          };
        }
      }

      if (next.children && next.children.length > 0) {
        next = { ...next, children: mapComponents(next.children) };
      }
      return next;
    });

  return mapComponents(components);
}

