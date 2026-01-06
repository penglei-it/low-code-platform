import { useState, useCallback, useEffect, useRef } from 'react';
import { Row, Col, Card, Space, Button, message } from 'antd';
import { useParams } from 'react-router-dom';
import { SaveOutlined } from '@ant-design/icons';
import ComponentPanel from '@/components/editor/ComponentPanel';
import Canvas from '@/components/editor/Canvas';
import PropertyPanel from '@/components/editor/PropertyPanel';
import ComponentTree from '@/components/editor/ComponentTree';
import AIAssistant from '@/components/editor/AIAssistant';
import Preview from '@/components/editor/Preview';
import EventPanel from '@/components/editor/EventPanel';
import DataBindingPanel from '@/components/editor/DataBindingPanel';
import { useEditorStore } from '@/stores/editorStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Tabs } from 'antd';

/**
 * Visual editor page component
 * Main editor interface with component panel, canvas, and property panel
 * @returns {JSX.Element} Editor page component
 */
function Editor() {
  const { selectedComponent, setSelectedComponent, components, saveProject, loadProject } = useEditorStore();
  const params = useParams<{ projectId?: string }>();
  const projectId = params.projectId || 'default';
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // 启用键盘快捷键
  useKeyboardShortcuts();

  // 加载项目组件
  useEffect(() => {
    if (projectId && projectId !== 'default') {
      loadProject(projectId).catch((error) => {
        message.warning('加载项目失败，使用空白画布');
        console.error('Load project error:', error);
      });
    }
  }, [projectId, loadProject]);

  // 自动保存（防抖，2秒后保存）
  useEffect(() => {
    if (projectId && projectId !== 'default' && components.length > 0) {
      // 清除之前的定时器
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // 设置新的保存定时器
      saveTimerRef.current = setTimeout(async () => {
        try {
          setIsSaving(true);
          await saveProject(projectId);
          // 同时保存到localStorage作为备份
          localStorage.setItem(`project_${projectId}_components`, JSON.stringify(components));
        } catch (error) {
          console.error('Auto save error:', error);
          // 保存失败时，至少保存到localStorage
          try {
            localStorage.setItem(`project_${projectId}_components`, JSON.stringify(components));
          } catch (localError) {
            console.error('LocalStorage save error:', localError);
          }
        } finally {
          setIsSaving(false);
        }
      }, 2000); // 2秒防抖
    }

    // 清理函数
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [components, projectId, saveProject]);

  // 手动保存
  const handleManualSave = useCallback(async () => {
    if (!projectId || projectId === 'default') {
      message.warning('请先创建或选择项目');
      return;
    }

    try {
      setIsSaving(true);
      await saveProject(projectId);
      // 同时保存到localStorage作为备份
      localStorage.setItem(`project_${projectId}_components`, JSON.stringify(components));
      message.success('项目已保存');
    } catch (error) {
      message.error('保存失败，已保存到本地');
      // 保存失败时，至少保存到localStorage
      try {
        localStorage.setItem(`project_${projectId}_components`, JSON.stringify(components));
      } catch (localError) {
        console.error('LocalStorage save error:', localError);
      }
    } finally {
      setIsSaving(false);
    }
  }, [projectId, components, saveProject]);

  // 处理组件选择
  const handleSelectComponent = useCallback((componentId: string | null) => {
    setSelectedComponent(componentId);
  }, [setSelectedComponent]);

  return (
    <div style={{ height: 'calc(100vh - 112px)', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部工具栏 */}
      <div className="editor-toolbar">
        <div>
          <span className="editor-toolbar-title">可视化编辑器</span>
          {projectId && projectId !== 'default' && (
            <span style={{ marginLeft: 12, color: '#999', fontSize: '12px' }}>
              项目ID: {projectId}
            </span>
          )}
        </div>
        <div>
          <Space>
            {projectId && projectId !== 'default' && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleManualSave}
                loading={isSaving}
                size="small"
              >
                {isSaving ? '保存中...' : '保存'}
              </Button>
            )}
            <Preview />
          </Space>
        </div>
      </div>

      <Row gutter={16} style={{ flex: 1, overflow: 'hidden' }}>
        {/* 左侧：组件面板 */}
        <Col span={4} style={{ height: '100%', overflow: 'auto' }}>
          <Card title="组件库" size="small" style={{ height: '100%' }}>
            <ComponentPanel />
          </Card>
        </Col>

        {/* 中间：画布和组件树 */}
        <Col span={14} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Row gutter={8} style={{ flex: 1, overflow: 'hidden' }}>
            {/* 组件树 */}
            <Col span={6} style={{ height: '100%', overflow: 'auto' }}>
              <Card title="组件树" size="small" style={{ height: '100%' }}>
                <ComponentTree onSelect={handleSelectComponent} />
              </Card>
            </Col>

            {/* 画布 */}
            <Col span={18} style={{ height: '100%', overflow: 'auto' }}>
              <Card title="画布" size="small" style={{ height: '100%' }}>
                <Canvas onSelectComponent={handleSelectComponent} />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* 右侧：属性面板和AI助手 */}
        <Col span={6} style={{ height: '100%', overflow: 'auto' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Card title="AI助手" size="small">
              <AIAssistant />
            </Card>
            <Card size="small" style={{ flex: 1 }}>
              <Tabs
                defaultActiveKey="properties"
                items={[
                  {
                    key: 'properties',
                    label: '属性',
                    children: <PropertyPanel componentId={selectedComponent} />,
                  },
                  {
                    key: 'events',
                    label: '事件',
                    children: <EventPanel componentId={selectedComponent} />,
                  },
                  {
                    key: 'data',
                    label: '数据',
                    children: <DataBindingPanel componentId={selectedComponent} />,
                  },
                ]}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}

export default Editor;

