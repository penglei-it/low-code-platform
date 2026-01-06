import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';

const router = express.Router();

// 数据模型创建Schema
const createDataModelSchema = z.object({
  name: z.string().min(1, '数据模型名称不能为空'),
  fields: z.array(z.any()),
  description: z.string().optional(),
});

/**
 * Get all data models
 * 获取所有数据模型
 */
router.get('/', async (req, res) => {
  try {
    const dataModels = await prisma.dataModel.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    // 解析JSON字段
    // Parse JSON fields
    const modelsWithParsedData = dataModels.map((model: { fields: string | null; [key: string]: unknown }) => ({
      ...model,
      fields: model.fields ? JSON.parse(model.fields) : [],
    }));
    res.json({ success: true, data: modelsWithParsedData });
  } catch (error: any) {
    console.error('获取数据模型列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get single data model by ID
 * 根据ID获取单个数据模型
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const model = await prisma.dataModel.findUnique({
      where: { id },
    });
    if (!model) {
      return res.status(404).json({ success: false, error: '数据模型不存在' });
    }
    // 解析JSON字段
    const modelWithParsedData = {
      ...model,
      fields: model.fields ? JSON.parse(model.fields) : [],
    };
    res.json({ success: true, data: modelWithParsedData });
  } catch (error: any) {
    console.error('获取数据模型失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create data model
 * 创建数据模型
 */
router.post('/', async (req, res) => {
  try {
    const validatedData = createDataModelSchema.parse(req.body);
    const newModel = await prisma.dataModel.create({
      data: {
        name: validatedData.name,
        fields: JSON.stringify(validatedData.fields || []),
        description: validatedData.description || null,
      },
    });
    // 解析JSON字段
    const modelWithParsedData = {
      ...newModel,
      fields: validatedData.fields || [],
    };
    res.status(201).json({ success: true, data: modelWithParsedData });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    console.error('创建数据模型失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Update data model
 * 更新数据模型
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existingModel = await prisma.dataModel.findUnique({
      where: { id },
    });
    if (!existingModel) {
      return res.status(404).json({ success: false, error: '数据模型不存在' });
    }

    const validatedData = createDataModelSchema.partial().parse(req.body);
    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.fields !== undefined) updateData.fields = JSON.stringify(validatedData.fields);
    if (validatedData.description !== undefined) updateData.description = validatedData.description;

    const updatedModel = await prisma.dataModel.update({
      where: { id },
      data: updateData,
    });
    // 解析JSON字段
    const modelWithParsedData = {
      ...updatedModel,
      fields: updatedModel.fields ? JSON.parse(updatedModel.fields) : [],
    };
    res.json({ success: true, data: modelWithParsedData });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    console.error('更新数据模型失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delete data model
 * 删除数据模型
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existingModel = await prisma.dataModel.findUnique({
      where: { id },
    });
    if (!existingModel) {
      return res.status(404).json({ success: false, error: '数据模型不存在' });
    }

    await prisma.dataModel.delete({
      where: { id },
    });
    res.json({ success: true, message: '数据模型已删除' });
  } catch (error: any) {
    console.error('删除数据模型失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

