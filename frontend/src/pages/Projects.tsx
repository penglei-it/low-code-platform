import { useState, useEffect } from 'react';
import { Typography, Button, Table, Space, Tag, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { projectAPI, Project } from '@/services/api';
import { logger } from '@/utils/logger';
import { handleError } from '@/utils/errorHandler';

const { Title } = Typography;

/**
 * Projects management page
 * @returns {JSX.Element} Projects page component
 */
function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 加载项目列表
  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectAPI.getAll();
      setProjects(data);
      logger.info('项目列表加载成功', { count: data.length });
    } catch (error) {
      handleError(error, {
        customMessage: '加载项目列表失败',
        logError: true,
      });
      // 失败时尝试从localStorage加载（降级方案）
      try {
        const saved = localStorage.getItem('projects');
        if (saved) {
          const localProjects = JSON.parse(saved) as Project[];
          setProjects(localProjects);
          message.warning('使用本地缓存数据');
        }
      } catch (localError) {
        logger.error('从localStorage加载失败', localError);
      }
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取项目列表
  useEffect(() => {
    loadProjects();
  }, []);

  // 表格列定义
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '活跃' : '已归档'}
        </Tag>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/editor/${record.id}`)}
          >
            编辑
          </Button>
          <Button type="link" icon={<EditOutlined />}>
            修改
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

  // 处理删除
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个项目吗？删除后无法恢复。',
      onOk: async () => {
        try {
          await projectAPI.delete(id);
          setProjects(projects.filter((p) => p.id !== id));
          message.success('删除成功');
          logger.info('项目已删除', { id });
        } catch (error) {
          handleError(error, {
            customMessage: '删除项目失败',
            logError: true,
          });
        }
      },
    });
  };

  // 处理创建项目
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const newProject = await projectAPI.create({
        name: values.name,
        description: values.description || '',
      });
      setProjects([...projects, newProject]);
      setIsModalVisible(false);
      form.resetFields();
      message.success('创建成功');
      logger.info('项目已创建', { id: newProject.id, name: newProject.name });
    } catch (error) {
      handleError(error, {
        customMessage: '创建项目失败，请检查网络连接',
        logError: true,
      });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>项目管理</Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadProjects}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            新建项目
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={projects}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={loading}
        locale={{ emptyText: '暂无项目，点击"新建项目"开始创建' }}
      />

      <Modal
        title="新建项目"
        open={isModalVisible}
        onOk={handleCreate}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item name="description" label="项目描述">
            <Input.TextArea placeholder="请输入项目描述" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Projects;

