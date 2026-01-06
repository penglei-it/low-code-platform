import React, { useState, useRef, useEffect } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { Typography, Button, Card, Space, Modal, Form, Input, Select, message, Table, Tag, Descriptions, Timeline } from 'antd';
import { PlayCircleOutlined, SaveOutlined, ReloadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import {
  executeWorkflow,
  executeWorkflowStep,
  WorkflowInstance as EngineWorkflowInstance,
  saveWorkflowInstance,
  getWorkflowInstances,
  deleteWorkflowInstance,
} from '@/utils/workflowEngine';

const { Title } = Typography;

/**
 * Workflow node type
 * 工作流节点类型
 */
type NodeType = 'start' | 'end' | 'task' | 'condition' | 'approval';

/**
 * Workflow node
 * 工作流节点
 */
interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  config?: any;
}

/**
 * Workflow edge
 * 工作流连线
 */
interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

/**
 * Workflows management page
 * 工作流管理页面
 * @returns {JSX.Element} Workflows page component
 */
function Workflows() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: 'start_1',
      type: 'start',
      label: '开始',
      x: 100,
      y: 100,
    },
  ]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isNodeModalVisible, setIsNodeModalVisible] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [form] = Form.useForm();
  const [instances, setInstances] = useState<EngineWorkflowInstance[]>([]);
  const [executingInstanceId, setExecutingInstanceId] = useState<string | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<EngineWorkflowInstance | null>(null);
  const [isInstanceModalVisible, setIsInstanceModalVisible] = useState(false);

  // 加载保存的实例
  useEffect(() => {
    const savedInstances = getWorkflowInstances();
    setInstances(savedInstances);
  }, []);

  // 生成唯一ID
  const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 添加节点
  const handleAddNode = (type: NodeType) => {
    const newNode: WorkflowNode = {
      id: generateId(),
      type,
      label:
        type === 'start'
          ? '开始'
          : type === 'end'
          ? '结束'
          : type === 'task'
          ? '任务'
          : type === 'condition'
          ? '条件'
          : '审批',
      x: Math.random() * 300 + 100,
      y: Math.random() * 300 + 100,
    };
    setNodes([...nodes, newNode]);
    message.success('节点已添加');
  };

  // 删除节点
  const handleDeleteNode = (id: string) => {
    setNodes(nodes.filter((n: WorkflowNode) => n.id !== id));
    setEdges(edges.filter((e: WorkflowEdge) => e.source !== id && e.target !== id));
    message.success('节点已删除');
  };

  // 开始连线
  const handleStartConnect = (nodeId: string) => {
    setIsConnecting(true);
    setConnectingFrom(nodeId);
  };

  // 完成连线
  const handleEndConnect = (targetId: string) => {
    if (isConnecting && connectingFrom && connectingFrom !== targetId) {
      const newEdge: WorkflowEdge = {
        id: `edge_${Date.now()}`,
        source: connectingFrom,
        target: targetId,
      };
      // 检查是否已存在连线
      const exists = edges.some(
        (e: WorkflowEdge) => e.source === connectingFrom && e.target === targetId
      );
      if (!exists) {
        setEdges([...edges, newEdge]);
        message.success('连线已创建');
      } else {
        message.warning('连线已存在');
      }
    }
    setIsConnecting(false);
    setConnectingFrom(null);
  };

  // 编辑节点
  const handleEditNode = (node: WorkflowNode) => {
    setSelectedNode(node);
    form.setFieldsValue({
      label: node.label,
      type: node.type,
      ...node.config,
    });
    setIsNodeModalVisible(true);
  };

  // 保存节点配置
  const handleSaveNode = async () => {
    try {
      const values = await form.validateFields();
      if (selectedNode) {
        setNodes(
          nodes.map((node: WorkflowNode) =>
            node.id === selectedNode.id
              ? {
                  ...node,
                  label: values.label,
                  config: values,
                }
              : node
          )
        );
        message.success('节点配置已保存');
      }
      setIsNodeModalVisible(false);
      form.resetFields();
      setSelectedNode(null);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // 处理运行工作流（完整执行）
  const handleRun = async () => {
    const startNode = nodes.find((n: WorkflowNode) => n.type === 'start');
    if (!startNode) {
      message.error('请先添加开始节点');
      return;
    }

    const instance: EngineWorkflowInstance = {
      id: `instance_${Date.now()}`,
      workflowId: 'current',
      workflowName: '当前工作流',
      currentNodeId: startNode.id,
      status: 'running',
      data: {},
      history: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      setExecutingInstanceId(instance.id);
      message.loading('工作流执行中...', 0);

      // 执行工作流（完整执行）
      const updatedInstance = await executeWorkflow(
        nodes.map((n: WorkflowNode) => ({
          id: n.id,
          type: n.type,
          label: n.label,
          config: n.config,
        })),
        edges.map((e: WorkflowEdge) => ({
          id: e.id,
          source: e.source,
          target: e.target,
        })),
        instance,
        (stepInstance) => {
          // 每步执行后保存
          saveWorkflowInstance(stepInstance);
          setInstances(getWorkflowInstances());
        }
      );

      message.destroy();
      saveWorkflowInstance(updatedInstance);
      setInstances(getWorkflowInstances());
      message.success(`工作流执行完成，状态：${updatedInstance.status}`);
    } catch (error) {
      message.destroy();
      console.error('工作流执行失败:', error);
      message.error('工作流执行失败');
    } finally {
      setExecutingInstanceId(null);
    }
  };

  // 单步执行工作流
  const handleStepExecute = async (instanceId: string) => {
    const instance = instances.find((i: EngineWorkflowInstance) => i.id === instanceId);
    if (!instance || instance.status !== 'running') {
      message.warning('只能执行运行中的工作流实例');
      return;
    }

    try {
      setExecutingInstanceId(instanceId);
      const updatedInstance = await executeWorkflowStep(
        nodes.map((n: WorkflowNode) => ({
          id: n.id,
          type: n.type,
          label: n.label,
          config: n.config,
        })),
        edges.map((e: WorkflowEdge) => ({
          id: e.id,
          source: e.source,
          target: e.target,
        })),
        instance
      );

      saveWorkflowInstance(updatedInstance);
      setInstances(getWorkflowInstances());
      message.success('执行一步完成');
    } catch (error) {
      console.error('单步执行失败:', error);
      message.error('单步执行失败');
    } finally {
      setExecutingInstanceId(null);
    }
  };

  // 查看实例详情
  const handleViewInstance = (instance: EngineWorkflowInstance) => {
    setSelectedInstance(instance);
    setIsInstanceModalVisible(true);
  };

  // 删除实例
  const handleDeleteInstance = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个工作流实例吗？',
      onOk: () => {
        deleteWorkflowInstance(id);
        setInstances(getWorkflowInstances());
        message.success('删除成功');
      },
    });
  };

  // 保存工作流
  const handleSave = () => {
    const workflow = {
      nodes,
      edges,
    };
    console.log('Workflow data:', workflow);
    message.success('工作流已保存');
  };

  // 获取节点样式
  const getNodeStyle = (type: NodeType) => {
    const styles: Record<NodeType, CSSProperties> = {
      start: { backgroundColor: '#52c41a', color: '#fff' },
      end: { backgroundColor: '#ff4d4f', color: '#fff' },
      task: { backgroundColor: '#1890ff', color: '#fff' },
      condition: { backgroundColor: '#faad14', color: '#fff' },
      approval: { backgroundColor: '#722ed1', color: '#fff' },
    };
    return styles[type] || {};
  };

  // 计算连线路径
  const getEdgePath = (source: WorkflowNode, target: WorkflowNode): string => {
    const dx = target.x - source.x;
    const midX = source.x + dx / 2;
    return `M ${source.x + 50} ${source.y + 25} L ${midX} ${source.y + 25} L ${midX} ${target.y + 25} L ${target.x + 50} ${target.y + 25}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>工作流引擎</Title>
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleRun}
            loading={executingInstanceId !== null}
          >
            完整执行工作流
          </Button>
          <Button icon={<SaveOutlined />} onClick={handleSave}>
            保存工作流
          </Button>
        </Space>
      </div>

      <Card>
        <div style={{ display: 'flex', height: 'calc(100vh - 200px)' }}>
          {/* 左侧：节点类型 */}
          <div style={{ width: 200, borderRight: '1px solid #f0f0f0', padding: 16 }}>
            <Title level={4}>节点类型</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block onClick={() => handleAddNode('start')}>
                开始节点
              </Button>
              <Button block onClick={() => handleAddNode('task')}>
                任务节点
              </Button>
              <Button block onClick={() => handleAddNode('condition')}>
                条件节点
              </Button>
              <Button block onClick={() => handleAddNode('approval')}>
                审批节点
              </Button>
              <Button block onClick={() => handleAddNode('end')}>
                结束节点
              </Button>
            </Space>
            {isConnecting && (
              <div style={{ marginTop: 16, padding: 8, backgroundColor: '#fff7e6', borderRadius: 4 }}>
                <div style={{ fontSize: 12, color: '#faad14' }}>
                  点击目标节点完成连线
                </div>
              </div>
            )}
          </div>

          {/* 中间：流程设计器 */}
          <div
            ref={canvasRef}
            style={{
              flex: 1,
              position: 'relative',
              overflow: 'auto',
              backgroundColor: '#f5f5f5',
            }}
          >
            {/* 渲染连线 */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              {edges.map((edge: WorkflowEdge) => {
                const sourceNode = nodes.find((n: WorkflowNode) => n.id === edge.source);
                const targetNode = nodes.find((n: WorkflowNode) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;
                return (
                  <path
                    key={edge.id}
                    d={getEdgePath(sourceNode, targetNode)}
                    stroke="#1890ff"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#1890ff" />
                </marker>
              </defs>
            </svg>

            {/* 渲染节点 */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              {nodes.map((node: WorkflowNode) => (
                <div
                  key={node.id}
                  style={{
                    position: 'absolute',
                    left: node.x,
                    top: node.y,
                    width: 100,
                    height: 50,
                    ...getNodeStyle(node.type),
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: selectedNode?.id === node.id ? '2px solid #1890ff' : 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                  onClick={() => handleEditNode(node)}
                  onContextMenu={(e: MouseEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    handleDeleteNode(node.id);
                  }}
                >
                  <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 'bold' }}>
                    {node.label}
                  </div>
                  {node.type !== 'start' && (
                    <Button
                      size="small"
                      type="link"
                      style={{ position: 'absolute', left: -30, color: '#1890ff' }}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleStartConnect(node.id);
                      }}
                    >
                      连接
                    </Button>
                  )}
                  {isConnecting && connectingFrom !== node.id && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: '#52c41a',
                        cursor: 'pointer',
                        border: '2px solid #fff',
                      }}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleEndConnect(node.id);
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 节点配置模态框 */}
      <Modal
        title="节点配置"
        open={isNodeModalVisible}
        onOk={handleSaveNode}
        onCancel={() => {
          setIsNodeModalVisible(false);
          form.resetFields();
          setSelectedNode(null);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="节点名称" name="label" rules={[{ required: true }]}>
            <Input placeholder="请输入节点名称" />
          </Form.Item>
          <Form.Item label="节点类型" name="type">
            <Select disabled>
              <Select.Option value="start">开始</Select.Option>
              <Select.Option value="task">任务</Select.Option>
              <Select.Option value="condition">条件</Select.Option>
              <Select.Option value="approval">审批</Select.Option>
              <Select.Option value="end">结束</Select.Option>
            </Select>
          </Form.Item>
          {selectedNode?.type === 'task' && (
            <>
              <Form.Item label="任务描述" name="description">
                <Input.TextArea placeholder="请输入任务描述" rows={3} />
              </Form.Item>
              <Form.Item label="执行人" name="assignee">
                <Input placeholder="请输入执行人" />
              </Form.Item>
            </>
          )}
          {selectedNode?.type === 'condition' && (
            <Form.Item label="条件表达式" name="expression">
              <Input.TextArea placeholder="请输入条件表达式，如：status === 'active'" rows={3} />
            </Form.Item>
          )}
          {selectedNode?.type === 'approval' && (
            <>
              <Form.Item label="审批人" name="approver">
                <Input placeholder="请输入审批人" />
              </Form.Item>
              <Form.Item label="审批规则" name="rule">
                <Select>
                  <Select.Option value="single">单人审批</Select.Option>
                  <Select.Option value="all">会签（全部通过）</Select.Option>
                  <Select.Option value="any">或签（任意一人通过）</Select.Option>
                </Select>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      {/* 工作流实例列表 */}
      <Card style={{ marginTop: 16 }}>
        <Title level={4}>工作流实例</Title>
        <Table
          dataSource={instances}
          columns={[
            {
              title: 'ID',
              dataIndex: 'id',
              key: 'id',
              width: 120,
              render: (text: string) => text.substring(0, 12) + '...',
            },
            {
              title: '名称',
              dataIndex: 'workflowName',
              key: 'workflowName',
              render: (text: string | undefined) => text || '未命名工作流',
            },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              width: 100,
              render: (status: string) => {
                const colorMap: Record<string, string> = {
                  running: 'processing',
                  completed: 'success',
                  rejected: 'error',
                  cancelled: 'default',
                  pending: 'warning',
                };
                const statusMap: Record<string, string> = {
                  running: '运行中',
                  completed: '已完成',
                  rejected: '已拒绝',
                  cancelled: '已取消',
                  pending: '待处理',
                };
                return <Tag color={colorMap[status] || 'default'}>{statusMap[status] || status}</Tag>;
              },
            },
            {
              title: '创建时间',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 180,
              render: (timestamp: number) => new Date(timestamp).toLocaleString(),
            },
            {
              title: '操作',
              key: 'action',
              width: 200,
              render: (_: unknown, record: EngineWorkflowInstance) => (
                <Space>
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewInstance(record)}
                  >
                    查看
                  </Button>
                  {record.status === 'running' && (
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={() => handleStepExecute(record.id)}
                      loading={executingInstanceId === record.id}
                    >
                      单步执行
                    </Button>
                  )}
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteInstance(record.id)}
                  >
                    删除
                  </Button>
                </Space>
              ),
            },
          ]}
          pagination={{ pageSize: 10 }}
          size="small"
          rowKey="id"
        />
      </Card>

      {/* 实例详情模态框 */}
      <Modal
        title="工作流实例详情"
        open={isInstanceModalVisible}
        onCancel={() => {
          setIsInstanceModalVisible(false);
          setSelectedInstance(null);
        }}
        footer={null}
        width={800}
      >
        {selectedInstance && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="实例ID">{selectedInstance.id}</Descriptions.Item>
              <Descriptions.Item label="工作流名称">
                {selectedInstance.workflowName || '未命名'}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag
                  color={
                    selectedInstance.status === 'running'
                      ? 'processing'
                      : selectedInstance.status === 'completed'
                      ? 'success'
                      : selectedInstance.status === 'rejected'
                      ? 'error'
                      : 'default'
                  }
                >
                  {selectedInstance.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="当前节点">
                {selectedInstance.currentNodeId}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(selectedInstance.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {new Date(selectedInstance.updatedAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Title level={5}>执行历史</Title>
              <Timeline>
                {selectedInstance.history.map((item: EngineWorkflowInstance['history'][number], index: number) => (
                  <Timeline.Item key={index} color={item.action === 'executed' ? 'green' : 'red'}>
                    <div>
                      <strong>{item.nodeLabel || item.nodeId}</strong>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        {new Date(item.timestamp).toLocaleString()} - {item.action}
                      </div>
                      {item.result && (
                        <div style={{ marginTop: 8, fontSize: 12 }}>
                          {item.result.success ? (
                            <Tag color="success">成功</Tag>
                          ) : (
                            <Tag color="error">失败: {item.result.error}</Tag>
                          )}
                          {item.result.data && (
                            <pre style={{ marginTop: 4, fontSize: 11, background: '#f5f5f5', padding: 8 }}>
                              {JSON.stringify(item.result.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Workflows;
