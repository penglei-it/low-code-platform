import { useState, useMemo, useEffect } from 'react';
import { Modal, Radio, Space, Button, Switch, Form, Input, message } from 'antd';
import { EyeOutlined, MobileOutlined, TabletOutlined, DesktopOutlined } from '@ant-design/icons';
import { useEditorStore } from '@/stores/editorStore';
import ComponentRenderer from './ComponentRenderer';
import { applyMockDataToComponents, applyCustomMockData, applyApiMockData } from '@/utils/mockData';

/**
 * Preview device type
 * 预览设备类型
 */
type DeviceType = 'desktop' | 'tablet' | 'mobile';

/**
 * Device configuration
 * 设备配置
 */
const deviceConfig: Record<DeviceType, { width: string; height: string; name: string }> = {
  desktop: { width: '100%', height: '100%', name: '桌面端' },
  tablet: { width: '768px', height: '1024px', name: '平板' },
  mobile: { width: '375px', height: '667px', name: '手机' },
};

/**
 * Preview component
 * 预览组件，支持多设备预览
 * @returns {JSX.Element} Preview component
 */
function Preview() {
  const [isVisible, setIsVisible] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [useMockData, setUseMockData] = useState(true);
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  const [mockForm] = Form.useForm();
  const { components } = useEditorStore();

  // 加载本地自定义模拟数据
  useEffect(() => {
    const saved = localStorage.getItem('previewMockData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        mockForm.setFieldsValue({ mockData: JSON.stringify(parsed, null, 2) });
      } catch {
        // ignore
      }
    } else {
      mockForm.setFieldsValue({ mockData: '{\n  "componentId": {\n    "props": {\n      "title": "示例标题"\n    }\n  }\n}' });
    }
  }, [mockForm]);

  // 处理组件选择（预览模式下禁用）
  const handleSelectComponent = () => {
    // 预览模式下不处理选择
  };

  // 应用模拟数据的组件
  const previewComponents = useMemo(() => {
    if (!useMockData) return components;

    const customText = mockForm.getFieldValue('mockData');
    let overrides: Record<string, any> = {};
    try {
      overrides = customText ? JSON.parse(customText) : {};
    } catch {
      // JSON 解析失败则忽略自定义部分
    }

    const withMock = applyMockDataToComponents(components);
    const withApiMock = applyApiMockData(withMock);
    return applyCustomMockData(withApiMock, overrides);
  }, [components, useMockData, mockForm]);

  // 保存自定义模拟数据
  const handleSaveMockData = async () => {
    try {
      const values = await mockForm.validateFields();
      const parsed = values.mockData ? JSON.parse(values.mockData) : {};
      localStorage.setItem('previewMockData', JSON.stringify(parsed));
      message.success('模拟数据已保存');
      setIsMockModalOpen(false);
    } catch (error: any) {
      message.error(error?.message || '模拟数据保存失败，请检查JSON格式');
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<EyeOutlined />}
        onClick={() => setIsVisible(true)}
      >
        预览
      </Button>

      <Modal
        title={
          <Space>
            <span>页面预览</span>
            <Radio.Group
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="desktop">
                <DesktopOutlined /> 桌面
              </Radio.Button>
              <Radio.Button value="tablet">
                <TabletOutlined /> 平板
              </Radio.Button>
              <Radio.Button value="mobile">
                <MobileOutlined /> 手机
              </Radio.Button>
            </Radio.Group>
            <span style={{ marginLeft: 16 }}>
              <Switch
                checked={useMockData}
                onChange={setUseMockData}
                checkedChildren="模拟数据"
                unCheckedChildren="真实数据"
              />
            </span>
            {useMockData && (
              <Button
                size="small"
                onClick={() => setIsMockModalOpen(true)}
              >
                配置模拟数据
              </Button>
            )}
          </Space>
        }
        open={isVisible}
        onCancel={() => setIsVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '20px',
            backgroundColor: '#f0f0f0',
            minHeight: '80vh',
          }}
        >
          <div
            style={{
              width: deviceConfig[deviceType].width,
              minHeight: deviceConfig[deviceType].height,
              backgroundColor: '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              borderRadius: '8px',
              overflow: 'auto',
              padding: '20px',
              transition: 'all 0.3s',
            }}
          >
            {previewComponents.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '100px 20px',
                  color: '#999',
                }}
              >
                暂无内容，请在编辑器中添加组件
              </div>
            ) : (
              <div>
                {previewComponents.map((component) => (
                  <ComponentRenderer
                    key={component.id}
                    node={component}
                    onSelect={handleSelectComponent}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Preview;

