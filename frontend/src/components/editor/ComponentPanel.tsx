import { useDrag } from 'react-dnd';
import { Card, Typography, Space } from 'antd';
import {
  ContainerOutlined,
  AppstoreOutlined as ButtonIcon,
  EditOutlined,
  TableOutlined,
  FileTextOutlined,
  PictureOutlined,
  CaretDownOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  DotChartOutlined,
  MenuOutlined,
  HomeOutlined,
  AppstoreOutlined,
  MessageOutlined,
  LoadingOutlined,
  AppstoreAddOutlined,
} from '@ant-design/icons';
import { ComponentType } from '@/types/component';

const { Text } = Typography;

/**
 * Component library item
 * 组件库项
 */
interface ComponentItem {
  type: ComponentType;
  name: string;
  icon: React.ReactNode;
  description: string;
}

/**
 * Available components in the library
 * 组件库中可用的组件
 */
const componentLibrary: ComponentItem[] = [
  {
    type: 'container',
    name: '容器',
    icon: <ContainerOutlined />,
    description: '布局容器组件',
  },
  {
    type: 'button',
    name: '按钮',
    icon: <ButtonIcon />,
    description: '按钮组件',
  },
  {
    type: 'input',
    name: '输入框',
    icon: <EditOutlined />,
    description: '文本输入框',
  },
  {
    type: 'select',
    name: '选择器',
    icon: <CaretDownOutlined />,
    description: '下拉选择框',
  },
  {
    type: 'datepicker',
    name: '日期选择',
    icon: <CalendarOutlined />,
    description: '日期选择器',
  },
  {
    type: 'checkbox',
    name: '复选框',
    icon: <CheckSquareOutlined />,
    description: '多选框组件',
  },
  {
    type: 'radio',
    name: '单选框',
    icon: <DotChartOutlined />,
    description: '单选框组件',
  },
  {
    type: 'table',
    name: '表格',
    icon: <TableOutlined />,
    description: '数据表格',
  },
  {
    type: 'text',
    name: '文本',
    icon: <FileTextOutlined />,
    description: '文本显示',
  },
  {
    type: 'image',
    name: '图片',
    icon: <PictureOutlined />,
    description: '图片显示',
  },
  {
    type: 'menu',
    name: '菜单',
    icon: <MenuOutlined />,
    description: '导航菜单',
  },
  {
    type: 'breadcrumb',
    name: '面包屑',
    icon: <HomeOutlined />,
    description: '面包屑导航',
  },
  {
    type: 'pagination',
    name: '分页',
    icon: <AppstoreOutlined />,
    description: '分页组件',
  },
  {
    type: 'message',
    name: '消息提示',
    icon: <MessageOutlined />,
    description: '消息提示框',
  },
  {
    type: 'loading',
    name: '加载中',
    icon: <LoadingOutlined />,
    description: '加载动画',
  },
  {
    type: 'modal',
    name: '弹窗',
    icon: <AppstoreAddOutlined />,
    description: '模态对话框',
  },
];

/**
 * Draggable component item
 * 可拖拽的组件项
 */
function DraggableComponentItem({ item }: { item: ComponentItem }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { type: item.type, name: item.name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{
        padding: 12,
        marginBottom: 8,
        border: '1px solid #d9d9d9',
        borderRadius: 4,
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: '#fafafa',
        transition: 'all 0.2s',
      }}
    >
      <Space>
        <span style={{ fontSize: 20 }}>{item.icon}</span>
        <div>
          <Text strong>{item.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {item.description}
          </Text>
        </div>
      </Space>
    </div>
  );
}

/**
 * Component panel component
 * Displays available components that can be dragged onto the canvas
 * @returns {JSX.Element} Component panel
 */
function ComponentPanel() {
  return (
    <div>
      {componentLibrary.map((item) => (
        <DraggableComponentItem key={item.type} item={item} />
      ))}
    </div>
  );
}

export default ComponentPanel;

