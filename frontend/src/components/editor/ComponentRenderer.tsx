import { useMemo, useEffect, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import {
  Button,
  Input,
  Table,
  Card,
  Typography,
  Image,
  Select,
  DatePicker,
  Checkbox,
  Radio,
  Menu,
  Breadcrumb,
  Pagination,
  Spin,
  Alert,
  Modal,
} from 'antd';
import { ComponentNode } from '@/types/component';
import { useEditorStore } from '@/stores/editorStore';
import { executeEventHandler } from '@/utils/eventHandler';
import { applyDataBinding } from '@/utils/dataBinding';

const { Text } = Typography;

/**
 * Component renderer props
 * 组件渲染器属性
 */
interface ComponentRendererProps {
  node: ComponentNode;
  onSelect: (id: string | null) => void;
}

/**
 * Component renderer
 * Renders components based on their type and configuration
 * @param {ComponentRendererProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
function ComponentRenderer({ node, onSelect }: ComponentRendererProps) {
  const { selectedComponent, deleteComponent } = useEditorStore();
  const [boundProps, setBoundProps] = useState<Record<string, unknown>>(node.props || {});

  // 判断是否选中
  const isSelected = selectedComponent === node.id;

  // 条件渲染判断（支持表达式或值比较）
  const shouldRender = useMemo(() => {
    if (!node.condition) return true;
    const { expression, value } = node.condition;
    // 如果提供表达式，尝试执行；否则按值比较
    if (expression) {
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('props', `return (${expression});`);
        return !!fn(boundProps);
      } catch (error) {
        console.warn('条件表达式解析失败', error);
        return true;
      }
    }
    return value !== false && value !== null;
  }, [node.condition, boundProps]);

  // 处理数据绑定
  useEffect(() => {
    if (node.dataBinding) {
      applyDataBinding(node.dataBinding, node.type, node.props).then((props) => {
        setBoundProps(props);
      });
    } else {
      setBoundProps(node.props || {});
    }
  }, [node.dataBinding, node.props, node.type]);

  // 处理组件事件
  const handleComponentEvent = (eventType: string, event?: unknown): void => {
    if (node.events && node.events[eventType]) {
      executeEventHandler(node.events[eventType], event, {
        component: node,
        props: boundProps,
      });
    }
  };


  // 基础样式
  // Base style
  const baseStyle: React.CSSProperties = useMemo(
    () => {
      const style: React.CSSProperties = {
        position: 'relative',
        margin: '8px',
        padding: '8px',
        border: isSelected ? '2px solid #1890ff' : '1px dashed transparent',
        borderRadius: 4,
        cursor: 'pointer',
        minHeight: node.style?.height || 'auto',
        minWidth: node.style?.width || 'auto',
      };
      // 安全地合并样式，确保类型正确
      // Safely merge styles, ensuring correct types
      if (node.style) {
        Object.keys(node.style).forEach((key) => {
          const value = node.style?.[key];
          if (value !== undefined && value !== null) {
            if (key === 'flexDirection' && typeof value === 'string') {
              style[key] = value as React.CSSProperties['flexDirection'];
            } else {
              (style as any)[key] = value;
            }
          }
        });
      }
      return style;
    },
    [isSelected, node.style]
  );

  // 处理点击选择
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  // 处理删除
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡到父组件
    e.preventDefault(); // 阻止默认行为
    deleteComponent(node.id); // 只删除当前组件
    onSelect(null); // 清除选中状态
  };

  // 可拖拽的子组件包装器（用于容器内子组件排序）
  const DraggableChildItem = ({ child, index, parentId }: { child: ComponentNode; index: number; parentId: string }) => {
    const { moveComponent } = useEditorStore();
    
    // 拖拽源：使子组件可拖拽
    const [{ isDragging }, drag] = useDrag({
      type: 'child-component',
      item: () => ({ id: child.id, index, parentId }),
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    // 拖放目标：接收其他子组件的拖拽
    const [{ isOver }, drop] = useDrop({
      accept: 'child-component',
      drop: (item: { id: string; index: number; parentId: string }) => {
        // 只在同一个父容器内进行排序
        if (item.parentId !== parentId || item.id === child.id) {
          return;
        }
        // 在drop时重新获取最新的父容器和子组件列表
        const state = useEditorStore.getState();
        const findParent = (comps: ComponentNode[], targetId: string): ComponentNode | null => {
          for (const comp of comps) {
            if (comp.id === targetId) {
              return comp;
            }
            if (comp.children) {
              const found = findParent(comp.children, targetId);
              if (found) return found;
            }
          }
          return null;
        };
        
        const parent = findParent(state.components, parentId);
        if (!parent || !parent.children) {
          return;
        }
        
        const currentChildren = parent.children;
        const targetIndex = currentChildren.findIndex(c => c.id === child.id);
        const sourceIndex = currentChildren.findIndex(c => c.id === item.id);
        
        // 如果找到两个组件且位置不同，执行移动
        if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) {
          moveComponent(item.id, parentId, targetIndex);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    return (
      <div
        ref={(nodeRef) => {
          drag(drop(nodeRef));
        }}
        style={{
          opacity: isDragging ? 0.5 : 1,
          border: isOver ? '2px dashed #1890ff' : 'none',
          borderRadius: '4px',
          marginBottom: '4px',
        }}
      >
        <ComponentRenderer node={child} onSelect={onSelect} />
      </div>
    );
  };

  // 渲染子组件
  const renderChildren = () => {
    if (!node.children || node.children.length === 0) {
      return null;
    }
    // 如果是容器组件，子组件支持拖拽排序
    if (node.type === 'container') {
      return (
        <div>
          {node.children.map((child, index) => (
            <DraggableChildItem
              key={child.id}
              child={child}
              index={index}
              parentId={node.id}
            />
          ))}
        </div>
      );
    }
    // 其他类型的组件，子组件不支持拖拽
    return (
      <div>
        {node.children.map((child) => (
          <ComponentRenderer key={child.id} node={child} onSelect={onSelect} />
        ))}
      </div>
    );
  };

  // 根据组件类型渲染
  const renderComponent = () => {
    if (!shouldRender) {
      return null;
    }

    switch (node.type) {
      case 'container':
        return (
          <div style={baseStyle} onClick={handleClick}>
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 100,
                }}
              >
                <Button
                  size="small"
                  danger
                  onClick={handleDelete}
                  style={{ fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
            )}
            <div 
              style={{ padding: 16, backgroundColor: '#f0f0f0' }}
              onClick={(e) => {
                // 阻止点击容器内部区域时选中容器
                e.stopPropagation();
              }}
            >
              {renderChildren() || <Text type="secondary">容器组件</Text>}
            </div>
          </div>
        );

      case 'button':
        return (
          <div style={baseStyle} onClick={handleClick}>
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 100,
                }}
              >
                <Button
                  size="small"
                  danger
                  onClick={handleDelete}
                  style={{ fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
            )}
            <Button
              {...(boundProps as any)}
              onClick={(e) => {
                e.stopPropagation();
                handleComponentEvent('onClick', e);
              }}
            >
              {boundProps?.text || node.name}
            </Button>
          </div>
        );

      case 'input':
        return (
          <div style={baseStyle} onClick={handleClick}>
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 100,
                }}
              >
                <Button
                  size="small"
                  danger
                  onClick={handleDelete}
                  style={{ fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
            )}
            <Input
              {...(boundProps as any)}
              placeholder={boundProps?.placeholder || node.props?.placeholder || '请输入'}
              value={boundProps?.value}
              onChange={(e) => {
                handleComponentEvent('onChange', e);
              }}
              onFocus={(e) => {
                handleComponentEvent('onFocus', e);
              }}
              onBlur={(e) => {
                handleComponentEvent('onBlur', e);
              }}
            />
          </div>
        );

      case 'select':
        return (
          <div style={baseStyle} onClick={handleClick}>
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 100,
                }}
              >
                <Button
                  size="small"
                  danger
                  onClick={handleDelete}
                  style={{ fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
            )}
            <Select
              {...(boundProps as any)}
              placeholder={boundProps?.placeholder || '请选择'}
              style={{ width: boundProps?.width || node.props?.width || 200 }}
              options={boundProps?.options || node.props?.options || [
                { label: '选项1', value: '1' },
                { label: '选项2', value: '2' },
              ]}
              onChange={(value) => {
                handleComponentEvent('onChange', { target: { value } });
              }}
              onFocus={(e) => {
                handleComponentEvent('onFocus', e);
              }}
              onBlur={(e) => {
                handleComponentEvent('onBlur', e);
              }}
            />
          </div>
        );

      case 'datepicker':
        return (
          <div style={baseStyle} onClick={handleClick}>
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 100,
                }}
              >
                <Button
                  size="small"
                  danger
                  onClick={handleDelete}
                  style={{ fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
            )}
            <DatePicker
              {...(node.props as any)}
              placeholder={node.props?.placeholder || '请选择日期'}
              style={{ width: node.props?.width || 200 }}
            />
          </div>
        );

      case 'checkbox':
        return (
          <div style={baseStyle} onClick={handleClick}>
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 100,
                }}
              >
                <Button
                  size="small"
                  danger
                  onClick={handleDelete}
                  style={{ fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
            )}
            <Checkbox {...(node.props as any)}>
              {node.props?.label || '复选框'}
            </Checkbox>
          </div>
        );

      case 'radio':
        return (
          <div style={baseStyle} onClick={handleClick}>
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 100,
                }}
              >
                <Button
                  size="small"
                  danger
                  onClick={handleDelete}
                  style={{ fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
            )}
            <Radio.Group {...(node.props as any)}>
              {Array.isArray(node.props?.options) && node.props.options.length > 0
                ? node.props.options.map((opt: any, index: number) => (
                    <Radio key={index} value={opt.value}>
                      {opt.label}
                    </Radio>
                  ))
                : <Radio value="1">选项1</Radio>}
            </Radio.Group>
          </div>
        );

      case 'table':
        return (
          <div style={baseStyle} onClick={handleClick}>
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 100,
                }}
              >
                <Button
                  size="small"
                  danger
                  onClick={handleDelete}
                  style={{ fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
            )}
            <Table
              {...(boundProps as any)}
              dataSource={boundProps?.dataSource || node.props?.dataSource || []}
              columns={boundProps?.columns || node.props?.columns || []}
              pagination={false}
              size="small"
            />
          </div>
        );

      case 'text':
        return (
          <div style={baseStyle} onClick={handleClick}>
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 100,
                }}
              >
                <Button
                  size="small"
                  danger
                  onClick={handleDelete}
                  style={{ fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
            )}
            <Text {...(boundProps as any)}>
              {boundProps?.content || boundProps?.value || node.props?.content || '文本内容'}
            </Text>
          </div>
        );

      case 'image':
        return (
          <div style={baseStyle} onClick={handleClick}>
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 100,
                }}
              >
                <Button
                  size="small"
                  danger
                  onClick={handleDelete}
                  style={{ fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
            )}
            <Image
              {...(node.props as any)}
              src={node.props?.src || 'https://via.placeholder.com/300x200'}
              alt={node.props?.alt || '图片'}
              width={node.props?.width || 200}
              height={node.props?.height || 150}
            />
          </div>
        );

      case 'card':
        return (
          <div style={baseStyle} onClick={handleClick}>
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 100,
                }}
              >
                <Button
                  size="small"
                  danger
                  onClick={handleDelete}
                  style={{ fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
            )}
            <Card
              {...(node.props as any)}
              title={node.props?.title || '卡片标题'}
              size="small"
            >
              {renderChildren() || <Text type="secondary">卡片内容</Text>}
            </Card>
          </div>
        );

      case 'menu':
        return (
          <div style={baseStyle} onClick={handleClick}>
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 100,
                }}
              >
                <Button
                  size="small"
                  danger
                  onClick={handleDelete}
                  style={{ fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
            )}
            <Menu
              {...(node.props as any)}
              mode={node.props?.mode || 'horizontal'}
              items={
                node.props?.items || [
                  { key: '1', label: '菜单项1' },
                  { key: '2', label: '菜单项2' },
                  { key: '3', label: '菜单项3' },
                ]
              }
            />
          </div>
        );

      case 'breadcrumb':
        return (
          <div style={baseStyle} onClick={handleClick}>
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 100,
                }}
              >
                <Button
                  size="small"
                  danger
                  onClick={handleDelete}
                  style={{ fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
            )}
            <Breadcrumb
              {...(node.props as any)}
              items={
                node.props?.items || [
                  { title: '首页' },
                  { title: '应用' },
                  { title: '列表' },
                ]
              }
            />
          </div>
        );

      case 'pagination':
        return (
          <div style={baseStyle} onClick={handleClick}>
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 100,
                }}
              >
                <Button
                  size="small"
                  danger
                  onClick={handleDelete}
                  style={{ fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
            )}
            <Pagination
              {...(node.props as any)}
              current={node.props?.current || 1}
              total={node.props?.total || 50}
              pageSize={node.props?.pageSize || 10}
            />
          </div>
        );

      case 'message':
        return (
          <div style={baseStyle} onClick={handleClick}>
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 100,
                }}
              >
                <Button
                  size="small"
                  danger
                  onClick={handleDelete}
                  style={{ fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
            )}
            <Alert
              {...(node.props as any)}
              message={node.props?.message || '消息提示'}
              type={node.props?.type || 'info'}
              showIcon
            />
          </div>
        );

      case 'loading':
        return (
          <div style={baseStyle} onClick={handleClick}>
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 100,
                }}
              >
                <Button
                  size="small"
                  danger
                  onClick={handleDelete}
                  style={{ fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
            )}
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Spin 
                size="large" 
                tip={typeof node.props?.tip === 'string' || typeof node.props?.tip === 'number' 
                  ? String(node.props.tip) 
                  : '加载中...'} 
              />
            </div>
          </div>
        );

      case 'modal':
        return (
          <div style={baseStyle} onClick={handleClick}>
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 100,
                }}
              >
                <Button
                  size="small"
                  danger
                  onClick={handleDelete}
                  style={{ fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
            )}
            <Button type="primary">
              {typeof node.props?.triggerText === 'string' || typeof node.props?.triggerText === 'number'
                ? String(node.props.triggerText)
                : '打开弹窗'}
            </Button>
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              (弹窗组件 - 点击按钮打开)
            </div>
          </div>
        );

      default:
        return (
          <div style={baseStyle} onClick={handleClick}>
            <Text type="secondary">未知组件类型: {node.type}</Text>
          </div>
        );
    }
  };

  return renderComponent();
}

export default ComponentRenderer;

