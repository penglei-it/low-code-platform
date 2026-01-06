import { Card, Row, Col, Typography, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  EditOutlined,
  FolderOutlined,
  DatabaseOutlined,
  ApartmentOutlined,
  FormOutlined,
  ApiOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

/**
 * Home page component
 * @returns {JSX.Element} Home page with feature cards
 */
function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: '可视化编辑器',
      description: '拖拽式页面构建，所见即所得',
      icon: <EditOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      path: '/editor',
    },
    {
      title: '项目管理',
      description: '管理您的所有低代码项目',
      icon: <FolderOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      path: '/projects',
    },
    {
      title: '数据模型',
      description: '设计和管理数据模型',
      icon: <DatabaseOutlined style={{ fontSize: 48, color: '#faad14' }} />,
      path: '/data-models',
    },
    {
      title: '工作流',
      description: '设计和执行业务流程',
      icon: <ApartmentOutlined style={{ fontSize: 48, color: '#f5222d' }} />,
      path: '/workflows',
    },
    {
      title: '表单设计器',
      description: '快速构建动态表单',
      icon: <FormOutlined style={{ fontSize: 48, color: '#13c2c2' }} />,
      path: '/form-designer',
    },
    {
      title: 'API设计器',
      description: '设计接口并快速测试与模拟',
      icon: <ApiOutlined style={{ fontSize: 48, color: '#722ed1' }} />,
      path: '/api-designer',
    },
  ];

  return (
    <div>
      <Title level={1}>欢迎使用低代码开发平台</Title>
      <Paragraph style={{ fontSize: 16, marginBottom: 32 }}>
        通过可视化拖拽和AI智能辅助，快速构建企业级应用
      </Paragraph>

      <Row gutter={[24, 24]}>
        {features.map((feature, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              hoverable
              style={{ textAlign: 'center', height: '100%' }}
              onClick={() => navigate(feature.path)}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {feature.icon}
                <Title level={4}>{feature.title}</Title>
                <Paragraph type="secondary">{feature.description}</Paragraph>
                <Button type="primary" onClick={(e) => {
                  e.stopPropagation();
                  navigate(feature.path);
                }}>
                  开始使用
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default Home;

