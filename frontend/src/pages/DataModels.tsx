import { useState, useEffect } from 'react';
import { Typography, Button, Table, Space, Modal, Form, Input, Select, message, Card, Tabs, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DatabaseOutlined, EyeOutlined } from '@ant-design/icons';
import { DataModel, DataModelField } from '@/types/api';
import { handleError } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';
import { modelNameRule, fieldNameRule } from '@/utils/validation';
import '@/styles/common.css';

const { Title } = Typography;
const { TextArea } = Input;

/**
 * Data models management page
 * 数据模型管理页面
 * @returns {JSX.Element} Data models page component
 */
function DataModels() {
  const [dataModels, setDataModels] = useState<DataModel[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewingModel, setPreviewingModel] = useState<DataModel | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [editingModel, setEditingModel] = useState<DataModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 从localStorage加载数据模型
  useEffect(() => {
    loadDataModels();
  }, []);

  const loadDataModels = (): void => {
    try {
      const saved = localStorage.getItem('data_models');
      if (saved) {
        const models = JSON.parse(saved) as DataModel[];
        setDataModels(models);
      }
    } catch (error) {
      handleError(error, {
        customMessage: '加载数据模型失败',
      });
    }
  };

  const saveDataModels = (models: DataModel[]): void => {
    try {
      localStorage.setItem('data_models', JSON.stringify(models));
      setDataModels(models);
    } catch (error) {
      handleError(error, {
        customMessage: '保存数据模型失败',
      });
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '模型名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '字段数量',
      dataIndex: 'fields',
      key: 'fields',
      render: (fields: DataModelField[]) => fields?.length || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: DataModel) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handlePreviewData(record)}>
            预览数据
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 处理创建/编辑
  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const modelData: Partial<DataModel> = {
        name: values.name,
        description: values.description || '',
        fields: (values.fields || []) as DataModelField[],
      };

      if (editingModel) {
        // 更新
        const updated = dataModels.map((m) =>
          m.id === editingModel.id
            ? { ...m, ...modelData, updatedAt: new Date().toISOString() }
            : m
        );
        saveDataModels(updated);
        message.success('更新成功');
        logger.info('数据模型更新成功', { id: editingModel.id, name: modelData.name });
      } else {
        // 创建
        const newModel: DataModel = {
          id: Date.now().toString(),
          name: modelData.name || '',
          description: modelData.description,
          fields: modelData.fields || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveDataModels([...dataModels, newModel]);
        message.success('创建成功');
        logger.info('数据模型创建成功', { id: newModel.id, name: newModel.name });
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingModel(null);
    } catch (error) {
      handleError(error, {
        customMessage: '保存数据模型失败，请检查输入内容',
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理编辑
  const handleEdit = (model: DataModel): void => {
    setEditingModel(model);
    form.setFieldsValue({
      name: model.name,
      description: model.description,
      fields: model.fields || [],
    });
    setIsModalVisible(true);
  };

  // 处理删除
  const handleDelete = (id: string): void => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个数据模型吗？',
      onOk: () => {
        try {
          const updated = dataModels.filter((m) => m.id !== id);
          saveDataModels(updated);
          message.success('删除成功');
          logger.info('数据模型删除成功', { id });
        } catch (error) {
          handleError(error, {
            customMessage: '删除数据模型失败',
          });
        }
      },
    });
  };

  // 预览数据
  const handlePreviewData = (model: DataModel): void => {
    setPreviewingModel(model);
    // 生成模拟数据
    const mockData: Record<string, unknown>[] = [];
    for (let i = 0; i < 5; i++) {
      const row: Record<string, unknown> = { key: i };
      (model.fields || []).forEach((field) => {
        switch (field.type) {
          case 'string':
            row[field.name] = `示例文本${i + 1}`;
            break;
          case 'number':
            row[field.name] = i + 1;
            break;
          case 'boolean':
            row[field.name] = i % 2 === 0;
            break;
          case 'date':
            row[field.name] = new Date().toISOString().split('T')[0];
            break;
          default:
            row[field.name] = `数据${i + 1}`;
        }
      });
      mockData.push(row);
    }
    setPreviewData(mockData);
    setIsPreviewModalVisible(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>
          <DatabaseOutlined /> 数据模型管理
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingModel(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          新建数据模型
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={dataModels}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: '暂无数据模型，点击"新建数据模型"开始创建' }}
        />
      </Card>

      <Modal
        title={editingModel ? '编辑数据模型' : '新建数据模型'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingModel(null);
        }}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="请输入模型名称，如：用户、订单等" />
          </Form.Item>

          <Form.Item name="description" label="模型描述">
            <TextArea placeholder="请输入模型描述" rows={3} />
          </Form.Item>

          <Form.List name="fields">
            {(fields: any[], { add, remove }: { add: () => void; remove: (index: number) => void }) => (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontWeight: 'bold' }}>字段定义</span>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加字段
                  </Button>
                </div>

                {fields.map(({ key, name, ...restField }: any) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'fieldName']}
                      rules={[{ required: true, message: '请输入字段名' }]}
                    >
                      <Input placeholder="字段名" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'fieldType']}
                      rules={[{ required: true, message: '请选择字段类型' }]}
                    >
                      <Select placeholder="类型" style={{ width: 120 }}>
                        <Select.Option value="string">字符串</Select.Option>
                        <Select.Option value="number">数字</Select.Option>
                        <Select.Option value="boolean">布尔值</Select.Option>
                        <Select.Option value="date">日期</Select.Option>
                        <Select.Option value="object">对象</Select.Option>
                        <Select.Option value="array">数组</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'required']} valuePropName="checked">
                      <Select placeholder="必填" style={{ width: 80 }}>
                        <Select.Option value={true}>必填</Select.Option>
                        <Select.Option value={false}>可选</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'description']}>
                      <Input placeholder="描述" style={{ width: 200 }} />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)}>
                      删除
                    </Button>
                  </Space>
                ))}
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* 数据预览模态框 */}
      <Modal
        title={`${previewingModel?.name || ''} - 数据预览`}
        open={isPreviewModalVisible}
        onCancel={() => setIsPreviewModalVisible(false)}
        footer={null}
        width={800}
      >
        {previewingModel && (
          <Table
            columns={(previewingModel.fields || []).map((field: any) => ({
              title: field.fieldName,
              dataIndex: field.fieldName,
              key: field.fieldName,
            }))}
            dataSource={previewData}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Modal>
    </div>
  );
}

export default DataModels;
