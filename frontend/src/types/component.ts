/**
 * Component type definition
 * 组件类型定义
 */
export type ComponentType =
  | 'container'
  | 'button'
  | 'input'
  | 'select'
  | 'datepicker'
  | 'checkbox'
  | 'radio'
  | 'table'
  | 'card'
  | 'image'
  | 'text'
  | 'form'
  | 'modal'
  | 'menu'
  | 'breadcrumb'
  | 'pagination'
  | 'message'
  | 'loading';

/**
 * Component property value type
 * 组件属性值类型
 */
export type PropertyValue = string | number | boolean | object | null | undefined;

/**
 * Component properties
 * 组件属性
 */
export interface ComponentProps {
  [key: string]: PropertyValue;
}

/**
 * Component style
 * 组件样式
 */
export interface ComponentStyle {
  width?: string | number;
  height?: string | number;
  margin?: string;
  padding?: string;
  backgroundColor?: string;
  color?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  border?: string;
  borderRadius?: string;
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  [key: string]: PropertyValue;
}

/**
 * Event handler type
 * 事件处理器类型
 */
export type EventHandlerType = 'onClick' | 'onChange' | 'onSubmit' | 'onFocus' | 'onBlur' | 'custom';

/**
 * Event handler configuration
 * 事件处理器配置
 */
export interface EventHandler {
  // 事件类型
  type: EventHandlerType;
  // 处理动作（showMessage, navigate, callAPI, setState等）
  action: string;
  // 动作参数
  params?: Record<string, any>;
  // 自定义代码
  code?: string;
}

/**
 * Data binding configuration
 * 数据绑定配置
 */
export interface DataBinding {
  // 数据源类型（static, api, model）
  sourceType: 'static' | 'api' | 'model';
  // 数据源ID或URL
  sourceId?: string;
  // 数据路径（如：data.list）
  dataPath?: string;
  // 默认值
  defaultValue?: any;
}

/**
 * Component node in the component tree
 * 组件树中的组件节点
 */
export interface ComponentNode {
  // 组件唯一ID
  id: string;
  // 组件类型
  type: ComponentType;
  // 组件名称
  name: string;
  // 组件属性
  props?: ComponentProps;
  // 组件样式
  style?: ComponentStyle;
  // 子组件
  children?: ComponentNode[];
  // 是否锁定（锁定后不可编辑）
  locked?: boolean;
  // 是否隐藏
  hidden?: boolean;
  // 事件处理器
  events?: Record<string, EventHandler>;
  // 数据绑定
  dataBinding?: DataBinding;
  // 条件渲染
  condition?: {
    // 条件表达式
    expression: string;
    // 条件值
    value: any;
  };
}

/**
 * Component schema definition
 * 组件Schema定义
 */
export interface ComponentSchema {
  // 组件类型
  type: ComponentType;
  // 组件名称
  name: string;
  // 组件图标
  icon?: string;
  // 组件描述
  description?: string;
  // 默认属性
  defaultProps?: ComponentProps;
  // 默认样式
  defaultStyle?: ComponentStyle;
  // 属性配置项
  propertyConfig?: PropertyConfig[];
  // 是否支持子组件
  canHaveChildren?: boolean;
  // 渲染函数
  render?: (node: ComponentNode) => React.ReactElement;
}

/**
 * Property configuration
 * 属性配置项
 */
export interface PropertyConfig {
  // 属性名称
  key: string;
  // 属性标签
  label: string;
  // 属性类型
  type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'json' | 'code';
  // 默认值
  defaultValue?: PropertyValue;
  // 选项（用于select类型）
  options?: { label: string; value: PropertyValue }[];
  // 是否必填
  required?: boolean;
  // 提示信息
  placeholder?: string;
}

