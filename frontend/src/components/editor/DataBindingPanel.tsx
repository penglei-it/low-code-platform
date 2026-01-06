import { useState, useEffect } from 'react';
import { Card, Form, Select, Input, message } from 'antd';
import { ComponentNode, DataBinding } from '@/types/component';
import { findComponent } from '@/utils/componentUtils';
import { useEditorStore } from '@/stores/editorStore';

/**
 * Data binding panel props
 * 数据绑定面板属性
 */
interface DataBindingPanelProps {
  componentId: string | null;
}

/**
 * Data binding panel component
 * 数据绑定配置面板，用于配置组件的数据绑定
 * @param {DataBindingPanelProps} props - Component props
 * @returns {JSX.Element} Data binding panel
 */
function DataBindingPanel({ componentId }: DataBindingPanelProps) {
  const { components, updateComponent } = useEditorStore();
  const [form] = Form.useForm();

  // 获取当前选中的组件
  const currentComponent: ComponentNode | null = componentId
    ? findComponent(components, componentId)
    : null;

  // 当选中组件变化时，更新表单
  useEffect(() => {
    if (currentComponent && currentComponent.dataBinding) {
      form.setFieldsValue(currentComponent.dataBinding);
    } else {
      form.resetFields();
    }
  }, [componentId, currentComponent, form]);

  // 处理数据绑定更新
  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (!currentComponent) return;

    const dataBinding: DataBinding = {
      sourceType: allValues.sourceType || 'static',
      sourceId: allValues.sourceId,
      dataPath: allValues.dataPath,
      defaultValue: allValues.defaultValue,
    };

    updateComponent(currentComponent.id, { dataBinding });
  };

  if (!currentComponent) {
    return (
      <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>
        请选择一个组件配置数据绑定
      </div>
    );
  }

  // 检查组件是否支持数据绑定
  const supportsDataBinding = ['table', 'select', 'input', 'text', 'image'].includes(
    currentComponent.type
  );

  if (!supportsDataBinding) {
    return (
      <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>
        该组件类型不支持数据绑定
      </div>
    );
  }

  return (
    <Card title="数据绑定" size="small">
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        initialValues={currentComponent.dataBinding || { sourceType: 'static' }}
      >
        <Form.Item label="数据源类型" name="sourceType">
          <Select>
            <Select.Option value="static">静态数据</Select.Option>
            <Select.Option value="api">API接口</Select.Option>
            <Select.Option value="model">数据模型</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.sourceType !== curr.sourceType}>
          {({ getFieldValue }) => {
            const sourceType = getFieldValue('sourceType');

            if (sourceType === 'api') {
              return (
                <>
                  <Form.Item label="API地址" name="sourceId">
                    <Input placeholder="请输入API地址，如：/api/users" />
                  </Form.Item>
                  <Form.Item label="数据路径" name="dataPath">
                    <Input placeholder="数据路径，如：data.list（可选）" />
                  </Form.Item>
                </>
              );
            }

            if (sourceType === 'model') {
              // 从localStorage获取数据模型列表（实际应用中应从后端获取）
              const models = JSON.parse(localStorage.getItem('dataModels') || '[]');
              return (
                <>
                  <Form.Item label="数据模型" name="sourceId">
                    <Select placeholder="请选择数据模型">
                      {models.map((model: any) => (
                        <Select.Option key={model.id} value={model.id}>
                          {model.name}
                        </Select.Option>
                      ))}
                      {models.length === 0 && (
                        <Select.Option value="" disabled>
                          暂无数据模型，请先创建
                        </Select.Option>
                      )}
                    </Select>
                  </Form.Item>
                  <Form.Item label="数据路径" name="dataPath">
                    <Input placeholder="数据路径，如：data.list（可选）" />
                  </Form.Item>
                </>
              );
            }

            if (sourceType === 'static') {
              return (
                <Form.Item label="默认值" name="defaultValue">
                  <Input.TextArea
                    placeholder="请输入默认值（JSON格式）"
                    rows={4}
                  />
                </Form.Item>
              );
            }

            return null;
          }}
        </Form.Item>
      </Form>
    </Card>
  );
}

export default DataBindingPanel;

