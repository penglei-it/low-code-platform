import { useState, useEffect } from 'react';
import { Card, Form, Select, Input, Button, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ComponentNode, EventHandler } from '@/types/component';
import { findComponent } from '@/utils/componentUtils';
import { useEditorStore } from '@/stores/editorStore';

const { TextArea } = Input;

/**
 * Event panel props
 * 事件面板属性
 */
interface EventPanelProps {
  componentId: string | null;
}

/**
 * Event panel component
 * 事件配置面板，用于配置组件的事件处理器
 * @param {EventPanelProps} props - Component props
 * @returns {JSX.Element} Event panel
 */
function EventPanel({ componentId }: EventPanelProps) {
  const { components, updateComponent } = useEditorStore();
  const [form] = Form.useForm();

  // 获取当前选中的组件
  const currentComponent: ComponentNode | null = componentId
    ? findComponent(components, componentId)
    : null;

  // 当选中组件变化时，更新表单
  useEffect(() => {
    if (currentComponent) {
      const events = currentComponent.events || {};
      const eventList = Object.keys(events).map((key) => ({
        ...events[key],
        type: key, // type 放在最后，确保不会被覆盖
      }));
      form.setFieldsValue({ events: eventList });
    } else {
      form.resetFields();
    }
  }, [componentId, currentComponent, form]);

  // 处理事件配置更新
  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (!currentComponent) return;

    const events: Record<string, EventHandler> = {};
    (allValues.events || []).forEach((event: any) => {
      if (event.type) {
        events[event.type] = {
          type: event.type as EventHandler['type'],
          action: event.action || 'showMessage',
          params: event.params || {},
          code: event.code,
        };
      }
    });

    updateComponent(currentComponent.id, { events });
  };

  if (!currentComponent) {
    return (
      <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>
        请选择一个组件配置事件
      </div>
    );
  }

  // 根据组件类型获取可用的事件类型
  const getAvailableEvents = (): Array<{ label: string; value: string }> => {
    const baseEvents = [
      { label: '点击事件', value: 'onClick' },
      { label: '值改变', value: 'onChange' },
    ];

    if (currentComponent.type === 'button') {
      return baseEvents;
    }

    if (['input', 'select', 'datepicker', 'checkbox', 'radio'].includes(currentComponent.type)) {
      return [
        { label: '值改变', value: 'onChange' },
        { label: '获得焦点', value: 'onFocus' },
        { label: '失去焦点', value: 'onBlur' },
      ];
    }

    if (currentComponent.type === 'form') {
      return [
        { label: '提交事件', value: 'onSubmit' },
      ];
    }

    return baseEvents;
  };

  return (
    <Card title="事件配置" size="small">
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <Form.List name="events">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card
                  key={key}
                  size="small"
                  style={{ marginBottom: 8 }}
                  extra={
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                    >
                      删除
                    </Button>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <Form.Item
                      {...restField}
                      name={[name, 'type']}
                      label="事件类型"
                      rules={[{ required: true, message: '请选择事件类型' }]}
                    >
                      <Select placeholder="选择事件类型" options={getAvailableEvents()} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'action']}
                      label="处理动作"
                      rules={[{ required: true, message: '请选择处理动作' }]}
                    >
                      <Select placeholder="选择处理动作">
                        <Select.Option value="showMessage">显示消息</Select.Option>
                        <Select.Option value="navigate">页面跳转</Select.Option>
                        <Select.Option value="callAPI">调用API</Select.Option>
                        <Select.Option value="setState">设置状态</Select.Option>
                        <Select.Option value="custom">自定义代码</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.events?.[name]?.action !== curr.events?.[name]?.action}>
                      {({ getFieldValue }) => {
                        const action = getFieldValue(['events', name, 'action']);
                        
                        if (action === 'showMessage') {
                          return (
                            <Form.Item
                              {...restField}
                              name={[name, 'params', 'message']}
                              label="消息内容"
                            >
                              <Input placeholder="请输入消息内容" />
                            </Form.Item>
                          );
                        }

                        if (action === 'navigate') {
                          return (
                            <Form.Item
                              {...restField}
                              name={[name, 'params', 'path']}
                              label="跳转路径"
                            >
                              <Input placeholder="请输入跳转路径，如：/home" />
                            </Form.Item>
                          );
                        }

                        if (action === 'callAPI') {
                          return (
                            <>
                              <Form.Item
                                {...restField}
                                name={[name, 'params', 'url']}
                                label="API地址"
                              >
                                <Input placeholder="请输入API地址" />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, 'params', 'method']}
                                label="请求方法"
                              >
                                <Select>
                                  <Select.Option value="GET">GET</Select.Option>
                                  <Select.Option value="POST">POST</Select.Option>
                                  <Select.Option value="PUT">PUT</Select.Option>
                                  <Select.Option value="DELETE">DELETE</Select.Option>
                                </Select>
                              </Form.Item>
                            </>
                          );
                        }

                        if (action === 'custom') {
                          return (
                            <Form.Item
                              {...restField}
                              name={[name, 'code']}
                              label="自定义代码"
                            >
                              <TextArea
                                placeholder="请输入JavaScript代码"
                                rows={6}
                              />
                            </Form.Item>
                          );
                        }

                        return null;
                      }}
                    </Form.Item>
                  </Space>
                </Card>
              ))}

              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                添加事件
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Card>
  );
}

export default EventPanel;

