import express from 'express';

const router = express.Router();

// 组件库定义
const componentLibrary = [
  {
    type: 'container',
    name: '容器',
    icon: 'ContainerOutlined',
    description: '布局容器组件',
    defaultProps: {},
    defaultStyle: {
      display: 'flex',
      flexDirection: 'column',
    },
  },
  {
    type: 'button',
    name: '按钮',
    icon: 'ButtonOutlined',
    description: '按钮组件',
    defaultProps: {
      text: '按钮',
      type: 'default',
    },
    defaultStyle: {},
  },
  {
    type: 'input',
    name: '输入框',
    icon: 'InputOutlined',
    description: '文本输入框',
    defaultProps: {
      placeholder: '请输入',
    },
    defaultStyle: {},
  },
  {
    type: 'table',
    name: '表格',
    icon: 'TableOutlined',
    description: '数据表格',
    defaultProps: {
      dataSource: [],
      columns: [],
    },
    defaultStyle: {},
  },
  {
    type: 'text',
    name: '文本',
    icon: 'FileTextOutlined',
    description: '文本显示',
    defaultProps: {
      content: '文本内容',
    },
    defaultStyle: {},
  },
  {
    type: 'image',
    name: '图片',
    icon: 'PictureOutlined',
    description: '图片显示',
    defaultProps: {
      src: 'https://via.placeholder.com/300x200',
      alt: '图片',
    },
    defaultStyle: {},
  },
  {
    type: 'card',
    name: '卡片',
    icon: 'CardOutlined',
    description: '卡片容器',
    defaultProps: {
      title: '卡片标题',
    },
    defaultStyle: {},
  },
];

// 获取所有组件
router.get('/', (req, res) => {
  try {
    res.json({ success: true, data: componentLibrary });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个组件信息
router.get('/:type', (req, res) => {
  try {
    const component = componentLibrary.find((c) => c.type === req.params.type);
    if (!component) {
      return res.status(404).json({ success: false, error: '组件不存在' });
    }
    res.json({ success: true, data: component });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

