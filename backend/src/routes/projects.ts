import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';

const router = express.Router();

// 项目创建Schema
const createProjectSchema = z.object({
  name: z.string().min(1, '项目名称不能为空'),
  description: z.string().optional(),
});

// 获取所有项目
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    // 解析JSON字段
    // Parse JSON fields
    const projectsWithParsedData = projects.map((project: { components: string | null; [key: string]: unknown }) => ({
      ...project,
      components: project.components ? JSON.parse(project.components) : [],
    }));
    res.json({ success: true, data: projectsWithParsedData });
  } catch (error: any) {
    console.error('获取项目列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个项目
router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!project) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }
    // 解析JSON字段
    const projectWithParsedData = {
      ...project,
      components: project.components ? JSON.parse(project.components) : [],
    };
    res.json({ success: true, data: projectWithParsedData });
  } catch (error: any) {
    console.error('获取项目失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建项目
router.post('/', async (req, res) => {
  try {
    const validatedData = createProjectSchema.parse(req.body);
    const newProject = await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        status: 'active',
        components: JSON.stringify([]), // 初始化为空数组
      },
    });
    // 解析JSON字段
    const projectWithParsedData = {
      ...newProject,
      components: [],
    };
    res.status(201).json({ success: true, data: projectWithParsedData });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    console.error('创建项目失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新项目
router.put('/:id', async (req, res) => {
  try {
    const existingProject = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!existingProject) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }

    const validatedData = createProjectSchema.partial().parse(req.body);
    const updatedProject = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...validatedData,
      },
    });
    // 解析JSON字段
    const projectWithParsedData = {
      ...updatedProject,
      components: updatedProject.components ? JSON.parse(updatedProject.components) : [],
    };
    res.json({ success: true, data: projectWithParsedData });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    console.error('更新项目失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除项目
router.delete('/:id', async (req, res) => {
  try {
    const existingProject = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!existingProject) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }

    await prisma.project.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: '项目已删除' });
  } catch (error: any) {
    console.error('删除项目失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 保存项目组件
router.post('/:id/components', async (req, res) => {
  try {
    const existingProject = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!existingProject) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }

    const { components } = req.body;
    const updatedProject = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        components: JSON.stringify(components || []),
      },
    });
    // 解析JSON字段
    const projectWithParsedData = {
      ...updatedProject,
      components: updatedProject.components ? JSON.parse(updatedProject.components) : [],
    };
    res.json({ success: true, data: projectWithParsedData });
  } catch (error: any) {
    console.error('保存项目组件失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

