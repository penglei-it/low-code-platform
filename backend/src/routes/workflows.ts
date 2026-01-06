import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';

const router = express.Router();

// 工作流创建Schema
const createWorkflowSchema = z.object({
  name: z.string().min(1, '工作流名称不能为空'),
  description: z.string().optional(),
  nodes: z.array(z.any()),
  edges: z.array(z.any()).optional(),
});

/**
 * Get all workflows
 * 获取所有工作流
 */
router.get('/', async (req, res) => {
  try {
    const workflows = await prisma.workflow.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    // 解析JSON字段
    // Parse JSON fields
    const workflowsWithParsedData = workflows.map((workflow: { nodes: string | null; edges: string | null; [key: string]: unknown }) => ({
      ...workflow,
      nodes: workflow.nodes ? JSON.parse(workflow.nodes) : [],
      edges: workflow.edges ? JSON.parse(workflow.edges) : [],
    }));
    res.json({ success: true, data: workflowsWithParsedData });
  } catch (error: any) {
    console.error('获取工作流列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get single workflow by ID
 * 根据ID获取单个工作流
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = await prisma.workflow.findUnique({
      where: { id },
    });
    if (!workflow) {
      return res.status(404).json({ success: false, error: '工作流不存在' });
    }
    // 解析JSON字段
    const workflowWithParsedData = {
      ...workflow,
      nodes: workflow.nodes ? JSON.parse(workflow.nodes) : [],
      edges: workflow.edges ? JSON.parse(workflow.edges) : [],
    };
    res.json({ success: true, data: workflowWithParsedData });
  } catch (error: any) {
    console.error('获取工作流失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create workflow
 * 创建工作流
 */
router.post('/', async (req, res) => {
  try {
    const validatedData = createWorkflowSchema.parse(req.body);
    const newWorkflow = await prisma.workflow.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        nodes: JSON.stringify(validatedData.nodes || []),
        edges: validatedData.edges ? JSON.stringify(validatedData.edges) : null,
      },
    });
    // 解析JSON字段
    const workflowWithParsedData = {
      ...newWorkflow,
      nodes: validatedData.nodes || [],
      edges: validatedData.edges || [],
    };
    res.status(201).json({ success: true, data: workflowWithParsedData });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    console.error('创建工作流失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Update workflow
 * 更新工作流
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existingWorkflow = await prisma.workflow.findUnique({
      where: { id },
    });
    if (!existingWorkflow) {
      return res.status(404).json({ success: false, error: '工作流不存在' });
    }

    const validatedData = createWorkflowSchema.partial().parse(req.body);
    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.nodes !== undefined) {
      updateData.nodes = JSON.stringify(validatedData.nodes);
    }
    if (validatedData.edges !== undefined) {
      updateData.edges = validatedData.edges ? JSON.stringify(validatedData.edges) : null;
    }

    const updatedWorkflow = await prisma.workflow.update({
      where: { id },
      data: updateData,
    });
    // 解析JSON字段
    const workflowWithParsedData = {
      ...updatedWorkflow,
      nodes: updatedWorkflow.nodes ? JSON.parse(updatedWorkflow.nodes) : [],
      edges: updatedWorkflow.edges ? JSON.parse(updatedWorkflow.edges) : [],
    };
    res.json({ success: true, data: workflowWithParsedData });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    console.error('更新工作流失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delete workflow
 * 删除工作流
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existingWorkflow = await prisma.workflow.findUnique({
      where: { id },
    });
    if (!existingWorkflow) {
      return res.status(404).json({ success: false, error: '工作流不存在' });
    }

    await prisma.workflow.delete({
      where: { id },
    });
    res.json({ success: true, message: '工作流已删除' });
  } catch (error: any) {
    console.error('删除工作流失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

