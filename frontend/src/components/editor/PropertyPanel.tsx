import { useEffect } from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import { useEditorStore } from '@/stores/editorStore';
import { ComponentNode } from '@/types/component';
import { findComponent } from '@/utils/componentUtils';

/**
 * Property panel props
 * 属性面板属性
 */
interface PropertyPanelProps {
  componentId: string | null;
}

/**
 * Property panel component
 * Allows editing component properties and styles
 * @param {PropertyPanelProps} props - Component props
 * @returns {JSX.Element} Property panel
 */
function PropertyPanel({ componentId }: PropertyPanelProps) {
  const { components, updateComponent } = useEditorStore();
  const [form] = Form.useForm();

  // 获取当前选中的组件
  const currentComponent: ComponentNode | null = componentId
    ? findComponent(components, componentId)
    : null;

  // 当选中组件变化时，更新表单
  useEffect(() => {
    if (currentComponent) {
      form.setFieldsValue({
        name: currentComponent.name,
        ...currentComponent.props,
        ...currentComponent.style,
      });
    } else {
      form.resetFields();
    }
  }, [componentId, currentComponent, form]);

  // 处理属性更新
  const handleValuesChange = (_changedValues: any, allValues: any) => {
    if (!currentComponent) return;

    // 分离样式属性和组件属性
    const styleKeys = [
      'width',
      'height',
      'margin',
      'padding',
      'backgroundColor',
      'color',
      'fontSize',
      'fontWeight',
      'border',
      'borderRadius',
      'display',
      'flexDirection',
      'justifyContent',
      'alignItems',
    ];

    const props: any = {};
    const style: any = {};

    Object.keys(allValues).forEach((key) => {
      if (key === 'name') {
        // 名称单独处理
        updateComponent(currentComponent.id, { name: allValues.name });
        return;
      }

      if (styleKeys.includes(key)) {
        style[key] = allValues[key];
      } else {
        props[key] = allValues[key];
      }
    });

    // 更新组件
    updateComponent(currentComponent.id, {
      props: { ...currentComponent.props, ...props },
      style: { ...currentComponent.style, ...style },
    });
  };

  if (!currentComponent) {
    return (
      <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>
        请选择一个组件进行编辑
      </div>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
      initialValues={{
        name: currentComponent.name,
        ...currentComponent.props,
        ...currentComponent.style,
      }}
    >
      <Form.Item label="组件名称" name="name">
        <Input placeholder="请输入组件名称" />
      </Form.Item>

      {/* 根据组件类型显示不同的属性配置 */}
      {currentComponent.type === 'button' && (
        <>
          <Form.Item label="按钮文本" name="text">
            <Input placeholder="请输入按钮文本" />
          </Form.Item>
          <Form.Item label="按钮类型" name="type">
            <Select>
              <Select.Option value="default">默认</Select.Option>
              <Select.Option value="primary">主要</Select.Option>
              <Select.Option value="dashed">虚线</Select.Option>
              <Select.Option value="link">链接</Select.Option>
            </Select>
          </Form.Item>
        </>
      )}

      {currentComponent.type === 'input' && (
        <>
          <Form.Item label="占位符" name="placeholder">
            <Input placeholder="请输入占位符文本" />
          </Form.Item>
          <Form.Item label="输入框大小" name="size">
            <Select>
              <Select.Option value="small">小</Select.Option>
              <Select.Option value="middle">中</Select.Option>
              <Select.Option value="large">大</Select.Option>
            </Select>
          </Form.Item>
        </>
      )}

      {currentComponent.type === 'select' && (
        <>
          <Form.Item label="占位符" name="placeholder">
            <Input placeholder="请输入占位符文本" />
          </Form.Item>
          <Form.Item label="宽度" name="width">
            <InputNumber min={1} placeholder="宽度" addonAfter="px" />
          </Form.Item>
        </>
      )}

      {currentComponent.type === 'datepicker' && (
        <>
          <Form.Item label="占位符" name="placeholder">
            <Input placeholder="请输入占位符文本" />
          </Form.Item>
          <Form.Item label="宽度" name="width">
            <InputNumber min={1} placeholder="宽度" addonAfter="px" />
          </Form.Item>
        </>
      )}

      {currentComponent.type === 'checkbox' && (
        <Form.Item label="标签文本" name="label">
          <Input placeholder="请输入标签文本" />
        </Form.Item>
      )}

      {currentComponent.type === 'radio' && (
        <Form.Item label="选项" name="options">
          <Input.TextArea
            placeholder='请输入选项，格式：{"label":"选项1","value":"1"},{"label":"选项2","value":"2"}'
            rows={4}
          />
        </Form.Item>
      )}

      {currentComponent.type === 'menu' && (
        <>
          <Form.Item label="菜单模式" name="mode">
            <Select>
              <Select.Option value="horizontal">水平</Select.Option>
              <Select.Option value="vertical">垂直</Select.Option>
              <Select.Option value="inline">内嵌</Select.Option>
            </Select>
          </Form.Item>
        </>
      )}

      {currentComponent.type === 'breadcrumb' && (
        <Form.Item label="面包屑项" name="items">
          <Input.TextArea
            placeholder='格式：[{"title":"首页"},{"title":"应用"}]'
            rows={4}
          />
        </Form.Item>
      )}

      {currentComponent.type === 'pagination' && (
        <>
          <Form.Item label="当前页" name="current">
            <InputNumber min={1} placeholder="当前页码" />
          </Form.Item>
          <Form.Item label="总条数" name="total">
            <InputNumber min={0} placeholder="总数据条数" />
          </Form.Item>
          <Form.Item label="每页条数" name="pageSize">
            <InputNumber min={1} placeholder="每页显示条数" />
          </Form.Item>
        </>
      )}

      {currentComponent.type === 'message' && (
        <>
          <Form.Item label="消息内容" name="message">
            <Input placeholder="请输入消息内容" />
          </Form.Item>
          <Form.Item label="消息类型" name="type">
            <Select>
              <Select.Option value="success">成功</Select.Option>
              <Select.Option value="info">信息</Select.Option>
              <Select.Option value="warning">警告</Select.Option>
              <Select.Option value="error">错误</Select.Option>
            </Select>
          </Form.Item>
        </>
      )}

      {currentComponent.type === 'loading' && (
        <Form.Item label="提示文本" name="tip">
          <Input placeholder="请输入加载提示文本" />
        </Form.Item>
      )}

      {currentComponent.type === 'modal' && (
        <>
          <Form.Item label="弹窗标题" name="title">
            <Input placeholder="请输入弹窗标题" />
          </Form.Item>
          <Form.Item label="触发按钮文本" name="triggerText">
            <Input placeholder="请输入触发按钮文本" />
          </Form.Item>
          <Form.Item label="弹窗内容" name="content">
            <Input.TextArea placeholder="请输入弹窗内容" rows={4} />
          </Form.Item>
          <Form.Item label="弹窗宽度" name="width">
            <InputNumber min={100} placeholder="弹窗宽度" addonAfter="px" />
          </Form.Item>
        </>
      )}

      {currentComponent.type === 'text' && (
        <Form.Item label="文本内容" name="content">
          <Input.TextArea placeholder="请输入文本内容" rows={4} />
        </Form.Item>
      )}

      {currentComponent.type === 'image' && (
        <>
          <Form.Item label="图片地址" name="src">
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <Form.Item label="宽度" name="width">
            <InputNumber min={1} placeholder="宽度" />
          </Form.Item>
          <Form.Item label="高度" name="height">
            <InputNumber min={1} placeholder="高度" />
          </Form.Item>
        </>
      )}

      {/* 通用样式配置 */}
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
        <h4>样式配置</h4>

        {/* 尺寸 */}
        <Form.Item label="宽度" name="width">
          <Input placeholder="如: 100px, 50%, auto" />
        </Form.Item>

        <Form.Item label="高度" name="height">
          <Input placeholder="如: 100px, auto" />
        </Form.Item>

        {/* 间距 */}
        <Form.Item label="外边距" name="margin">
          <Input placeholder="如: 10px 或 10px 20px 或 10px 20px 10px 20px" />
        </Form.Item>

        <Form.Item label="内边距" name="padding">
          <Input placeholder="如: 10px 或 10px 20px 或 10px 20px 10px 20px" />
        </Form.Item>

        {/* 颜色 */}
        <Form.Item label="背景色" name="backgroundColor">
          <Input placeholder="如: #ffffff, rgb(255,255,255), transparent" />
        </Form.Item>

        <Form.Item label="文字颜色" name="color">
          <Input placeholder="如: #000000, rgb(0,0,0)" />
        </Form.Item>

        {/* 字体 */}
        <Form.Item label="字体大小" name="fontSize">
          <InputNumber min={1} placeholder="字体大小" addonAfter="px" />
        </Form.Item>

        <Form.Item label="字体粗细" name="fontWeight">
          <Select placeholder="选择字体粗细">
            <Select.Option value="normal">正常 (400)</Select.Option>
            <Select.Option value="bold">粗体 (700)</Select.Option>
            <Select.Option value="lighter">细体 (300)</Select.Option>
            <Select.Option value="bolder">更粗 (900)</Select.Option>
            <Select.Option value="100">100</Select.Option>
            <Select.Option value="200">200</Select.Option>
            <Select.Option value="300">300</Select.Option>
            <Select.Option value="400">400</Select.Option>
            <Select.Option value="500">500</Select.Option>
            <Select.Option value="600">600</Select.Option>
            <Select.Option value="700">700</Select.Option>
            <Select.Option value="800">800</Select.Option>
            <Select.Option value="900">900</Select.Option>
          </Select>
        </Form.Item>

        {/* 边框 */}
        <Form.Item label="边框" name="border">
          <Input placeholder="如: 1px solid #d9d9d9" />
        </Form.Item>

        <Form.Item label="边框圆角" name="borderRadius">
          <Input placeholder="如: 4px, 50% (圆形)" />
        </Form.Item>

        {/* 布局 */}
        <Form.Item label="显示方式" name="display">
          <Select placeholder="选择显示方式">
            <Select.Option value="block">块级 (block)</Select.Option>
            <Select.Option value="inline">内联 (inline)</Select.Option>
            <Select.Option value="inline-block">内联块 (inline-block)</Select.Option>
            <Select.Option value="flex">弹性 (flex)</Select.Option>
            <Select.Option value="none">隐藏 (none)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Flex方向" name="flexDirection">
          <Select placeholder="选择Flex方向（需display为flex）">
            <Select.Option value="row">横向 (row)</Select.Option>
            <Select.Option value="column">纵向 (column)</Select.Option>
            <Select.Option value="row-reverse">横向反向</Select.Option>
            <Select.Option value="column-reverse">纵向反向</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Flex对齐" name="justifyContent">
          <Select placeholder="主轴对齐方式">
            <Select.Option value="flex-start">起始 (flex-start)</Select.Option>
            <Select.Option value="flex-end">末尾 (flex-end)</Select.Option>
            <Select.Option value="center">居中 (center)</Select.Option>
            <Select.Option value="space-between">两端对齐</Select.Option>
            <Select.Option value="space-around">环绕对齐</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="交叉轴对齐" name="alignItems">
          <Select placeholder="交叉轴对齐方式">
            <Select.Option value="flex-start">起始</Select.Option>
            <Select.Option value="flex-end">末尾</Select.Option>
            <Select.Option value="center">居中</Select.Option>
            <Select.Option value="stretch">拉伸</Select.Option>
            <Select.Option value="baseline">基线对齐</Select.Option>
          </Select>
        </Form.Item>

        {/* 定位（可选） */}
        <Form.Item label="定位方式" name="position">
          <Select placeholder="选择定位方式">
            <Select.Option value="static">静态 (static)</Select.Option>
            <Select.Option value="relative">相对 (relative)</Select.Option>
            <Select.Option value="absolute">绝对 (absolute)</Select.Option>
            <Select.Option value="fixed">固定 (fixed)</Select.Option>
            <Select.Option value="sticky">粘性 (sticky)</Select.Option>
          </Select>
        </Form.Item>

        {/* 文本对齐 */}
        <Form.Item label="文本对齐" name="textAlign">
          <Select placeholder="选择文本对齐方式">
            <Select.Option value="left">左对齐</Select.Option>
            <Select.Option value="center">居中</Select.Option>
            <Select.Option value="right">右对齐</Select.Option>
            <Select.Option value="justify">两端对齐</Select.Option>
          </Select>
        </Form.Item>
      </div>
    </Form>
  );
}

export default PropertyPanel;

