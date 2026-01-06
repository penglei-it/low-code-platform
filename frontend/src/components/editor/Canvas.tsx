import { useDrop, useDrag } from 'react-dnd';
import { Empty, Button, Space } from 'antd';
import { ClearOutlined, UndoOutlined, RedoOutlined } from '@ant-design/icons';
import { useEditorStore } from '@/stores/editorStore';
import ComponentRenderer from '@/components/editor/ComponentRenderer';
import { ComponentNode } from '@/types/component';

/**
 * Canvas component props
 * 画布组件属性
 */
interface CanvasProps {
  onSelectComponent: (id: string | null) => void;
}

/**
 * Draggable component wrapper for canvas sorting
 * 可拖拽的组件包装器，用于画布内排序
 */
function DraggableComponentItem({
  component,
  index,
  onSelect,
}: {
  component: ComponentNode;
  index: number;
  onSelect: (id: string | null) => void;
}) {
  const { components, moveComponent } = useEditorStore();
  
  // 拖拽源：使组件可拖拽
  const [{ isDragging }, drag] = useDrag({
    type: 'canvas-component',
    item: () => ({ id: component.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // 拖放目标：接收其他组件的拖拽
  const [{ isOver }, drop] = useDrop({
    accept: 'canvas-component',
    drop: (item: { id: string; index: number }) => {
      if (item.id === component.id) {
        // 拖拽到自己，不需要移动
        return;
      }
      // 在drop时重新获取最新的组件列表和索引
      const currentComponents = useEditorStore.getState().components;
      const targetIndex = currentComponents.findIndex(comp => comp.id === component.id);
      const sourceIndex = currentComponents.findIndex(comp => comp.id === item.id);
      
      // 如果找到两个组件且位置不同，执行移动
      if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) {
        moveComponent(item.id, '', targetIndex);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => {
        drag(drop(node));
      }}
      style={{
        opacity: isDragging ? 0.5 : 1,
        marginBottom: '8px',
        border: isOver ? '2px dashed #1890ff' : 'none',
        borderRadius: '4px',
        cursor: 'move',
      }}
    >
      <ComponentRenderer node={component} onSelect={onSelect} />
    </div>
  );
}

/**
 * Canvas component
 * Main editing area where components are dropped and arranged
 * @param {CanvasProps} props - Component props
 * @returns {JSX.Element} Canvas component
 */
function Canvas({ onSelectComponent }: CanvasProps) {
  const { components, addComponent, clearCanvas, undo, redo } = useEditorStore();

  // 处理从组件库拖拽新组件
  const [{ isOver }, drop] = useDrop({
    accept: 'component',
    drop: (item: { type: string; name: string }) => {
      addComponent({
        id: '',
        type: item.type as any,
        name: item.name,
        props: {},
        style: {},
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      style={{
        minHeight: '600px',
        padding: 24,
        backgroundColor: isOver ? '#e6f7ff' : '#fafafa',
        border: isOver ? '2px dashed #1890ff' : '1px dashed #d9d9d9',
        borderRadius: 4,
        transition: 'all 0.2s',
        position: 'relative',
      }}
    >
      {/* 工具栏 */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
        }}
      >
        <Space>
          <Button size="small" icon={<UndoOutlined />} onClick={undo}>
            撤销
          </Button>
          <Button size="small" icon={<RedoOutlined />} onClick={redo}>
            重做
          </Button>
          <Button
            size="small"
            danger
            icon={<ClearOutlined />}
            onClick={() => {
              clearCanvas();
              onSelectComponent(null);
            }}
          >
            清空
          </Button>
        </Space>
      </div>

      {/* 组件渲染区域 */}
      {components.length === 0 ? (
        <Empty
          description="从左侧组件库拖拽组件到此处开始构建页面"
          style={{ marginTop: 100 }}
        />
      ) : (
        <div>
          {components.map((component, index) => (
            <DraggableComponentItem
              key={component.id}
              component={component}
              index={index}
              onSelect={onSelectComponent}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Canvas;

