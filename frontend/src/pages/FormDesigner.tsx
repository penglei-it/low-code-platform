import { useState } from 'react';
import { Card, Button, Form, Input, Select, Space, Modal, message, Row, Col, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { formDefinitionAPI } from '@/services/api';

const { Title } = Typography;
const { TextArea } = Input;

/**
 * Form field type
 * 表单字段类型
 */
interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'input' | 'textarea' | 'select' | 'datepicker' | 'checkbox' | 'radio' | 'number';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  defaultValue?: any;
  span?: number; // 栅格布局span
}

/**
 * Form Designer component
 * 表单设计器组件
 * @returns {JSX.Element} Form designer component
 */
function FormDesigner() {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isFieldModalVisible, setIsFieldModalVisible] = useState(false);
  const [formConfig, setFormConfig] = useState<{
    id?: string;
    name: string;
    description: string;
    layout: 'vertical' | 'horizontal' | 'inline';
    labelCol: { span: number };
    wrapperCol: { span: number };
  }>({
    name: '',
    description: '',
    layout: 'vertical',
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  });
  const [fieldForm] = Form.useForm();
  const [configForm] = Form.useForm();

  // 生成唯一ID
  const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 添加字段
  const handleAddField = () => {
    setEditingField(null);
    fieldForm.resetFields();
    setIsFieldModalVisible(true);
  };

  // 编辑字段
  const handleEditField = (field: FormField) => {
    setEditingField(field);
    fieldForm.setFieldsValue(field);
    setIsFieldModalVisible(true);
  };

  // 删除字段
  const handleDeleteField = (id: string) => {
    setFormFields(formFields.filter((f) => f.id !== id));
    message.success('字段已删除');
  };

  // 保存字段
  const handleSaveField = async () => {
    try {
      const values = await fieldForm.validateFields();
      const field: FormField = {
        id: editingField?.id || generateId(),
        ...values,
      };

      if (editingField) {
        // 更新
        setFormFields(formFields.map((f) => (f.id === field.id ? field : f)));
        message.success('字段已更新');
      } else {
        // 新增
        setFormFields([...formFields, field]);
        message.success('字段已添加');
      }

      setIsFieldModalVisible(false);
      fieldForm.resetFields();
      setEditingField(null);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // 保存表单配置
  const handleSaveForm = async () => {
    try {
      const values = await configForm.validateFields();
      const formData = {
        ...formConfig,
        ...values,
        fields: formFields,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // 保存到localStorage（实际应用中应保存到后端）
      const savedForms = JSON.parse(localStorage.getItem('savedForms') || '[]');
      savedForms.push(formData);
      localStorage.setItem('savedForms', JSON.stringify(savedForms));
      
      setFormConfig({ ...formConfig, ...values });
      message.success('表单配置已保存');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // 提交表单数据
  const handleSubmitForm = async (formValues: any) => {
    try {
      if (formConfig.id && !formConfig.id.startsWith('form_')) {
        // 提交到后端
        try {
          await formDefinitionAPI.submit(formConfig.id, formValues);
          message.success('表单提交成功');
          return true;
        } catch (error) {
          console.warn('提交到后端失败，使用本地存储:', error);
          // 降级方案：保存到localStorage
          const formSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
          formSubmissions.push({
            formId: formConfig.id,
            formName: formConfig.name,
            data: formValues,
            submittedAt: new Date().toISOString(),
          });
          localStorage.setItem('formSubmissions', JSON.stringify(formSubmissions));
          message.success('表单提交成功（已保存到本地）');
          return true;
        }
      } else {
        // 没有表单ID，只保存到本地
        const formSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
        formSubmissions.push({
          formId: formConfig.name,
          formName: formConfig.name,
          data: formValues,
          submittedAt: new Date().toISOString(),
        });
        localStorage.setItem('formSubmissions', JSON.stringify(formSubmissions));
        message.success('表单提交成功');
        return true;
      }
    } catch (error) {
      message.error('表单提交失败');
      return false;
    }
  };

  // 预览表单
  const handlePreview = () => {
    const PreviewFormContent = () => {
      const [previewForm] = Form.useForm();
      
      const handleSubmit = async (values: any) => {
        const success = await handleSubmitForm(values);
        if (success) {
          previewForm.resetFields();
        }
      };

      return (
        <Form
          form={previewForm}
          layout={formConfig.layout}
          labelCol={formConfig.labelCol}
          wrapperCol={formConfig.wrapperCol}
          onFinish={handleSubmit}
        >
          {formFields.map((field) => (
            <Form.Item
              key={field.id}
              label={field.label}
              name={field.name}
              rules={[
                { required: field.required, message: `请输入${field.label}` },
                ...(field.validation?.pattern
                  ? [
                      {
                        pattern: new RegExp(field.validation.pattern),
                        message: field.validation.message || '格式不正确',
                      },
                    ]
                  : []),
              ]}
            >
              {field.type === 'input' && <Input placeholder={field.placeholder} />}
              {field.type === 'textarea' && <TextArea placeholder={field.placeholder} rows={4} />}
              {field.type === 'select' && (
                <Select placeholder={field.placeholder} options={field.options} />
              )}
              {field.type === 'datepicker' && <Input placeholder="请选择日期" />}
              {field.type === 'checkbox' && <Input type="checkbox" />}
              {field.type === 'radio' && (
                <Select placeholder={field.placeholder} options={field.options} />
              )}
              {field.type === 'number' && <Input type="number" placeholder={field.placeholder} />}
            </Form.Item>
          ))}
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              提交表单
            </Button>
          </Form.Item>
        </Form>
      );
    };

    Modal.info({
      title: '表单预览',
      width: 600,
      content: <PreviewFormContent />,
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>表单设计器</Title>
        <Space>
          <Button onClick={handlePreview}>预览表单</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveForm}>
            保存表单
          </Button>
        </Space>
      </div>

      <Row gutter={16}>
        {/* 左侧：表单配置 */}
        <Col span={6}>
          <Card title="表单配置" size="small">
            <Form form={configForm} layout="vertical" initialValues={formConfig}>
              <Form.Item label="表单名称" name="name" rules={[{ required: true }]}>
                <Input placeholder="请输入表单名称" />
              </Form.Item>
              <Form.Item label="表单描述" name="description">
                <TextArea placeholder="请输入表单描述" rows={3} />
              </Form.Item>
              <Form.Item label="布局方式" name="layout">
                <Select>
                  <Select.Option value="vertical">垂直布局</Select.Option>
                  <Select.Option value="horizontal">水平布局</Select.Option>
                  <Select.Option value="inline">行内布局</Select.Option>
                </Select>
              </Form.Item>
            </Form>
          </Card>

          <Card title="字段类型" size="small" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block onClick={() => handleAddField()}>
                添加输入框
              </Button>
              <Button block onClick={() => handleAddField()}>
                添加文本域
              </Button>
              <Button block onClick={() => handleAddField()}>
                添加选择器
              </Button>
              <Button block onClick={() => handleAddField()}>
                添加日期选择
              </Button>
            </Space>
          </Card>
        </Col>

        {/* 中间：表单设计区域 */}
        <Col span={12}>
          <Card title="表单设计" size="small" style={{ minHeight: 600 }}>
            {formFields.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 100, color: '#999' }}>
                从左侧添加字段开始设计表单
              </div>
            ) : (
              <Form layout={formConfig.layout} labelCol={formConfig.labelCol} wrapperCol={formConfig.wrapperCol}>
                {formFields.map((field, index) => (
                  <Row key={field.id} gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={field.span || 24}>
                      <div
                        style={{
                          padding: 16,
                          border: '1px dashed #d9d9d9',
                          borderRadius: 4,
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                          }}
                        >
                          <Space>
                            <Button
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleEditField(field)}
                            >
                              编辑
                            </Button>
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteField(field.id)}
                            >
                              删除
                            </Button>
                          </Space>
                        </div>
                        <Form.Item label={field.label} name={field.name}>
                          {field.type === 'input' && <Input placeholder={field.placeholder} disabled />}
                          {field.type === 'textarea' && (
                            <TextArea placeholder={field.placeholder} rows={4} disabled />
                          )}
                          {field.type === 'select' && (
                            <Select placeholder={field.placeholder} options={field.options} disabled />
                          )}
                          {field.type === 'datepicker' && <Input placeholder="请选择日期" disabled />}
                          {field.type === 'checkbox' && <Input type="checkbox" disabled />}
                          {field.type === 'radio' && (
                            <Select placeholder={field.placeholder} options={field.options} disabled />
                          )}
                          {field.type === 'number' && (
                            <Input type="number" placeholder={field.placeholder} disabled />
                          )}
                        </Form.Item>
                        {field.required && (
                          <span style={{ color: 'red', marginLeft: 4 }}>*</span>
                        )}
                      </div>
                    </Col>
                  </Row>
                ))}
              </Form>
            )}
          </Card>
        </Col>

        {/* 右侧：字段列表 */}
        <Col span={6}>
          <Card title="字段列表" size="small">
            {formFields.length === 0 ? (
              <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>暂无字段</div>
            ) : (
              <div>
                {formFields.map((field) => (
                  <div
                    key={field.id}
                    style={{
                      padding: 8,
                      marginBottom: 8,
                      border: '1px solid #f0f0f0',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleEditField(field)}
                  >
                    <div style={{ fontWeight: 'bold' }}>{field.label}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{field.type}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 字段编辑模态框 */}
      <Modal
        title={editingField ? '编辑字段' : '添加字段'}
        open={isFieldModalVisible}
        onOk={handleSaveField}
        onCancel={() => {
          setIsFieldModalVisible(false);
          fieldForm.resetFields();
          setEditingField(null);
        }}
        width={600}
      >
        <Form form={fieldForm} layout="vertical">
          <Form.Item label="字段名称" name="name" rules={[{ required: true, message: '请输入字段名称' }]}>
            <Input placeholder="字段的name属性，如：username" />
          </Form.Item>
          <Form.Item label="字段标签" name="label" rules={[{ required: true, message: '请输入字段标签' }]}>
            <Input placeholder="显示给用户的标签，如：用户名" />
          </Form.Item>
          <Form.Item label="字段类型" name="type" rules={[{ required: true, message: '请选择字段类型' }]}>
            <Select>
              <Select.Option value="input">输入框</Select.Option>
              <Select.Option value="textarea">文本域</Select.Option>
              <Select.Option value="select">选择器</Select.Option>
              <Select.Option value="datepicker">日期选择</Select.Option>
              <Select.Option value="checkbox">复选框</Select.Option>
              <Select.Option value="radio">单选框</Select.Option>
              <Select.Option value="number">数字输入</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="占位符" name="placeholder">
            <Input placeholder="请输入占位符文本" />
          </Form.Item>
          <Form.Item label="是否必填" name="required" valuePropName="checked">
            <Select>
              <Select.Option value={true}>是</Select.Option>
              <Select.Option value={false}>否</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              if (type === 'select' || type === 'radio') {
                return (
                  <Form.Item label="选项配置" name="options">
                    <TextArea
                      placeholder='格式：[{"label":"选项1","value":"1"},{"label":"选项2","value":"2"}]'
                      rows={4}
                    />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default FormDesigner;

