import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, theme } from 'antd';
import {
  HomeOutlined,
  EditOutlined,
  FolderOutlined,
  DatabaseOutlined,
  ApartmentOutlined,
  FormOutlined,
  ApiOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = AntLayout;

/**
 * Main layout component with sidebar navigation
 * @returns {JSX.Element} Layout component with navigation
 */
function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 菜单项配置
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/editor',
      icon: <EditOutlined />,
      label: '可视化编辑器',
    },
    {
      key: '/projects',
      icon: <FolderOutlined />,
      label: '项目管理',
    },
    {
      key: '/data-models',
      icon: <DatabaseOutlined />,
      label: '数据模型',
    },
    {
      key: '/workflows',
      icon: <ApartmentOutlined />,
      label: '工作流',
    },
    {
      key: '/form-designer',
      icon: <FormOutlined />,
      label: '表单设计器',
    },
    {
      key: '/api-designer',
      icon: <ApiOutlined />,
      label: 'API设计器',
    },
  ];

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // 获取当前选中的菜单项
  const selectedKeys = [location.pathname === '/editor' ? '/editor' : location.pathname];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        width={200}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 'bold',
          borderBottom: '1px solid #f0f0f0'
        }}>
          {collapsed ? '低代码' : '低代码平台'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <AntLayout>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer,
          borderBottom: '1px solid #f0f0f0'
        }}>
          <h2 style={{ margin: 0, lineHeight: '64px' }}>低代码开发平台</h2>
        </Header>
        <Content style={{ 
          margin: '24px', 
          padding: 24, 
          background: colorBgContainer,
          minHeight: 'calc(100vh - 112px)', // 减去Header高度(64px)和上下margin(48px)
          overflow: 'auto',
          height: 'calc(100vh - 112px)'
        }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}

export default Layout;

