/**
 * Workflow execution engine
 * 工作流执行引擎
 */

/**
 * Workflow node type
 * 工作流节点类型
 */
export type WorkflowNodeType = 'start' | 'end' | 'task' | 'condition' | 'approval';

/**
 * Workflow node
 * 工作流节点
 */
export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  config?: {
    // 任务节点配置
    taskType?: string;
    assignee?: string;
    // 条件节点配置
    condition?: string;
    // 审批节点配置
    approvers?: string[];
    timeout?: number;
  };
}

/**
 * Workflow edge
 * 工作流连线
 */
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string; // 条件分支的条件表达式
}

/**
 * Workflow instance
 * 工作流实例
 */
export interface WorkflowInstance {
  id: string;
  workflowId: string;
  workflowName?: string;
  currentNodeId: string;
  status: 'running' | 'completed' | 'rejected' | 'cancelled' | 'pending';
  data: Record<string, any>;
  history: Array<{
    nodeId: string;
    nodeLabel?: string;
    timestamp: number;
    action: string;
    user?: string;
    result?: any;
  }>;
  createdAt: number;
  updatedAt: number;
}

/**
 * Node execution result
 * 节点执行结果
 */
export interface NodeExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  nextNodeId?: string;
}

/**
 * Simulate async task execution
 * 模拟异步任务执行
 * @param node - Task node
 * @param instance - Workflow instance
 * @returns {Promise<NodeExecutionResult>} Execution result
 */
async function simulateTaskExecution(
  node: WorkflowNode,
  _instance: WorkflowInstance
): Promise<NodeExecutionResult> {
  // 模拟异步任务执行（延迟1-3秒）
  const delay = Math.random() * 2000 + 1000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // 模拟成功或失败（90%成功率）
  const success = Math.random() > 0.1;
  
  if (success) {
    return {
      success: true,
      data: {
        taskId: `task_${Date.now()}`,
        result: '任务执行成功',
        assignee: node.config?.assignee || '系统',
      },
    };
  } else {
    return {
      success: false,
      error: '任务执行失败：模拟错误',
    };
  }
}

/**
 * Simulate async approval
 * 模拟异步审批
 * @param node - Approval node
 * @param instance - Workflow instance
 * @returns {Promise<NodeExecutionResult>} Approval result
 */
async function simulateApproval(
  node: WorkflowNode,
  _instance: WorkflowInstance
): Promise<NodeExecutionResult> {
  // 模拟审批延迟（2-5秒）
  const delay = Math.random() * 3000 + 2000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // 模拟审批结果（80%通过率）
  const approved = Math.random() > 0.2;
  
  return {
    success: approved,
    data: {
      approved,
      approver: node.config?.approvers?.[0] || '审批人',
      comment: approved ? '审批通过' : '审批拒绝',
      timestamp: Date.now(),
    },
    error: approved ? undefined : '审批被拒绝',
  };
}

/**
 * Execute workflow node
 * 执行工作流节点
 * @param node - Workflow node
 * @param instance - Workflow instance
 * @returns {Promise<{ next: string | null; status: string; result?: NodeExecutionResult }>} Next node ID and status
 */
export async function executeNode(
  node: WorkflowNode,
  instance: WorkflowInstance
): Promise<{ next: string | null; status: string; result?: NodeExecutionResult }> {
  switch (node.type) {
    case 'start':
      // 开始节点，直接通过
      return { next: null, status: 'running', result: { success: true } };

    case 'task':
      // 任务节点，异步执行
      const taskResult = await simulateTaskExecution(node, instance);
      if (taskResult.success) {
        return { next: null, status: 'running', result: taskResult };
      } else {
        return { next: null, status: 'cancelled', result: taskResult };
      }

    case 'condition':
      // 条件节点，根据条件表达式判断
      if (node.config?.condition) {
        try {
          // 执行条件表达式（注意安全性）
          // 使用instance.data作为上下文
          // eslint-disable-next-line no-eval
          const result = eval(`(${node.config.condition})`);
          return {
            next: result ? 'true' : 'false',
            status: 'running',
            result: { success: true, data: { conditionResult: result } },
          };
        } catch (error) {
          console.error('条件表达式执行失败:', error);
          return {
            next: null,
            status: 'cancelled',
            result: { success: false, error: String(error) },
          };
        }
      }
      return { next: null, status: 'running', result: { success: true } };

    case 'approval':
      // 审批节点，异步审批
      const approvalResult = await simulateApproval(node, instance);
      if (approvalResult.success) {
        return { next: null, status: 'running', result: approvalResult };
      } else {
        return { next: null, status: 'rejected', result: approvalResult };
      }

    case 'end':
      // 结束节点
      return { next: null, status: 'completed', result: { success: true } };

    default:
      return { next: null, status: 'cancelled', result: { success: false, error: '未知节点类型' } };
  }
}

/**
 * Get next nodes from edges
 * 从连线中获取下一个节点
 * @param currentNodeId - Current node ID
 * @param edges - Workflow edges
 * @param conditionResult - Condition result (for condition nodes)
 * @returns {string[]} Next node IDs
 */
export function getNextNodes(
  currentNodeId: string,
  edges: WorkflowEdge[],
  conditionResult?: boolean
): string[] {
  const nextEdges = edges.filter((edge) => edge.source === currentNodeId);

  if (conditionResult !== undefined) {
    // 对于条件节点，根据条件结果选择分支
    return nextEdges
      .filter((edge) => {
        if (edge.condition) {
          // 检查条件是否匹配
          return edge.condition === String(conditionResult);
        }
        return true;
      })
      .map((edge) => edge.target);
  }

  return nextEdges.map((edge) => edge.target);
}

/**
 * Execute workflow step by step
 * 逐步执行工作流
 * @param nodes - Workflow nodes
 * @param edges - Workflow edges
 * @param instance - Workflow instance
 * @returns {Promise<WorkflowInstance>} Updated workflow instance
 */
export async function executeWorkflowStep(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  instance: WorkflowInstance
): Promise<WorkflowInstance> {
  const currentNode = nodes.find((n) => n.id === instance.currentNodeId);
  if (!currentNode) {
    return {
      ...instance,
      status: 'cancelled',
      updatedAt: Date.now(),
    };
  }

  // 执行当前节点
  const result = await executeNode(currentNode, instance);

  // 更新历史记录
  const history = [
    ...instance.history,
    {
      nodeId: currentNode.id,
      nodeLabel: currentNode.label,
      timestamp: Date.now(),
      action: result.result?.success ? 'executed' : 'failed',
      result: result.result,
    },
  ];

  // 获取下一个节点
  let nextNodeId: string | null = result.next;
  if (!nextNodeId) {
    const nextNodes = getNextNodes(currentNode.id, edges, result.result?.data?.conditionResult);
    nextNodeId = nextNodes[0] || null;
  }

  // 更新实例状态
  const updatedInstance: WorkflowInstance = {
    ...instance,
    currentNodeId: nextNodeId || instance.currentNodeId,
    status: result.status as WorkflowInstance['status'],
    history,
    updatedAt: Date.now(),
  };

  // 如果到达结束节点，标记为完成
  if (nextNodeId) {
    const nextNode = nodes.find((n) => n.id === nextNodeId);
    if (nextNode?.type === 'end') {
      updatedInstance.status = 'completed';
    }
  }

  return updatedInstance;
}

/**
 * Execute workflow completely
 * 完整执行工作流（自动执行所有步骤直到完成或失败）
 * @param nodes - Workflow nodes
 * @param edges - Workflow edges
 * @param instance - Workflow instance
 * @param onStep - Callback for each step
 * @returns {Promise<WorkflowInstance>} Final workflow instance
 */
export async function executeWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  instance: WorkflowInstance,
  onStep?: (instance: WorkflowInstance) => void
): Promise<WorkflowInstance> {
  let currentInstance = { ...instance };
  const maxSteps = 100; // 防止无限循环
  let stepCount = 0;

  while (
    currentInstance.status === 'running' &&
    currentInstance.currentNodeId &&
    stepCount < maxSteps
  ) {
    currentInstance = await executeWorkflowStep(nodes, edges, currentInstance);
    stepCount++;

    // 调用步骤回调
    if (onStep) {
      onStep(currentInstance);
    }

    // 如果状态不是运行中，停止执行
    if (currentInstance.status !== 'running') {
      break;
    }

    // 短暂延迟，便于观察执行过程
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return currentInstance;
}

/**
 * Save workflow instance to localStorage
 * 保存工作流实例到localStorage
 * @param instance - Workflow instance
 */
export function saveWorkflowInstance(instance: WorkflowInstance): void {
  try {
    const instances = getWorkflowInstances();
    const index = instances.findIndex((i) => i.id === instance.id);
    if (index >= 0) {
      instances[index] = instance;
    } else {
      instances.push(instance);
    }
    localStorage.setItem('workflowInstances', JSON.stringify(instances));
  } catch (error) {
    console.error('保存工作流实例失败:', error);
  }
}

/**
 * Get all workflow instances from localStorage
 * 从localStorage获取所有工作流实例
 * @returns {WorkflowInstance[]} Workflow instances
 */
export function getWorkflowInstances(): WorkflowInstance[] {
  try {
    const data = localStorage.getItem('workflowInstances');
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取工作流实例失败:', error);
  }
  return [];
}

/**
 * Get workflow instance by ID
 * 根据ID获取工作流实例
 * @param id - Instance ID
 * @returns {WorkflowInstance | null} Workflow instance
 */
export function getWorkflowInstance(id: string): WorkflowInstance | null {
  const instances = getWorkflowInstances();
  return instances.find((i) => i.id === id) || null;
}

/**
 * Delete workflow instance
 * 删除工作流实例
 * @param id - Instance ID
 */
export function deleteWorkflowInstance(id: string): void {
  try {
    const instances = getWorkflowInstances();
    const filtered = instances.filter((i) => i.id !== id);
    localStorage.setItem('workflowInstances', JSON.stringify(filtered));
  } catch (error) {
    console.error('删除工作流实例失败:', error);
  }
}

